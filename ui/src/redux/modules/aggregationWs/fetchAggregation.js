import { OrderedMap, Map, fromJS } from 'immutable';
import { createSelector } from 'reselect';
import moment from 'moment';
import { call, put, takeEvery, select, take, fork } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { getAppDataSelector } from 'ui/redux/modules/app';
import Cookies from 'js-cookie';
import { pickBy, get } from 'lodash';
import { testCookieName } from 'ui/utils/auth';

export function defaultMapping(results) {
  const out = new Map({
    result: results && new OrderedMap(results.map(v => fromJS([v._id, v]))),
  });
  return out;
}

const aggregationSelector = state => state.aggregationWs;

const aggregationRequestStateSelector = (pipeline, timeInterval) => createSelector(
  aggregationSelector,
  (aggregations) => {
    const out = aggregations.getIn([new Map({
      pipeline,
      timeIntervalSinceToday: get(timeInterval, 'timeIntervalSinceToday'),
      timeIntervalUnits: get(timeInterval, 'timeIntervalUnits')
    }), 'requestState']);
    return out;
  }
);

const aggregationShouldFetchSelector = (pipeline, timeIntetrval) => createSelector(
  aggregationRequestStateSelector(pipeline, timeIntetrval),
  (requestState) => {
    const out = (
      requestState !== IN_PROGRESS &&
      requestState !== COMPLETED &&
      requestState !== FAILED
    );
    return out;
  }
);

const aggregationShouldRecallSelector = pipeline => createSelector(
  aggregationSelector,
  (aggregations) => {
    const requestState = aggregations.getIn([pipeline, 'requestState']);
    if (requestState === IN_PROGRESS) {
      return false;
    }

    const result = aggregations.getIn([pipeline, 'result']);
    const startedAt = aggregations.getIn([pipeline, 'startedAt']);
    const completedAt = aggregations.getIn([pipeline, 'completedAt']);

    // Cached and is running
    const cachedAndIsRunning = startedAt && completedAt && moment(completedAt).isBefore(moment(startedAt));
    if (cachedAndIsRunning) {
      return true;
    }

    // No cache in redux
    if (!OrderedMap.isOrderedMap(result)) {
      return true;
    }

    // Redux has result, but completedAt is null
    if (completedAt === null) {
      return true;
    }

    return false;
  }
);

const fetchAggregation = createAsyncDuck({
  actionName: 'learninglocker/aggregation/FETCH_AGGREGATION_WS',
  failureDelay: 2000,

  reduceStart: (state, { pipeline, timeIntervalSinceToday, timeIntervalUnits }) => {
    const out = state
    .setIn([new Map({
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits
    }), 'requestState'], IN_PROGRESS);
    return out;
  },

  reduceSuccess: (state, {
    pipeline,
    timeIntervalSinceToday,
    timeIntervalUnits,
    result
  }) => {
    if (!pipeline) {
      return state;
    }

    const x = state
      .setIn([new Map({
        pipeline,
        timeIntervalSinceToday,
        timeIntervalUnits,
      }), 'requestState'], COMPLETED);

    if (result.get('result') === null) {
      return x;
    }

    const out = x.setIn([new Map({
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
    }), 'result'], result.getIn(['result']));

    return out;
  },

  reduceFailure: (state, { pipeline, err }) => state
    .setIn([pipeline, 'requestState'], FAILED)
    .setIn([pipeline, 'error'], err),

  reduceComplete: (state, { pipeline }) => state
    .setIn([pipeline, 'requestState'], COMPLETED),

  startAction: ({
    pipeline,
    mapping = defaultMapping,
    timeIntervalSinceToday,
    timeIntervalUnits
  }) => {
    const out = ({
      pipeline,
      mapping,
      timeIntervalSinceToday,
      timeIntervalUnits
    });
    return out;
  },

  successAction: (args) => {
    if (!args) {
      return {};
    }
    const { pipeline, timeIntervalSinceToday, timeIntervalUnits, result, sinceAt } = args;
    const out = ({ pipeline, timeIntervalSinceToday, timeIntervalUnits, result, sinceAt });
    return out;
  },

  failureAction: ({ pipeline, err }) => ({ pipeline, err }),

  completeAction: ({ pipeline }) => ({ pipeline }),

  checkShouldFire: ({
    pipeline,
    timeIntervalSinceToday,
    timeIntervalUnits
  }, state) => {
    const shouldFetch = aggregationShouldFetchSelector(pipeline, {
      timeIntervalSinceToday,
      timeIntervalUnits
    })(state);
    const shouldRecall = aggregationShouldRecallSelector(pipeline)(state);
    return shouldFetch || shouldRecall;
  },

  doAction: function* fetchAggregationSaga({
    pipeline,
    llClient,
    timeIntervalSinceToday,
    timeIntervalUnits,
    successAction,
    mapping
  }) {
    // const pipelineWithoutTime = pipeline.shift(); // DEBUG ONLY, the pipeline should be correct when it comes in.
    const { body } = yield call(llClient.aggregateWs, pipeline, timeIntervalSinceToday, timeIntervalUnits);
    yield put(successAction({ pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      result: mapping(body.results)
    }));

    const id = body._id;

    const state = yield select();
    const wsUrl = getAppDataSelector('WS_URL')(state);

    const websocket = new WebSocket(`${wsUrl}/websocket`);

    yield new Promise((resolve) => {
      websocket.addEventListener('open', () => {
        resolve();
      });
    });

    // handle responses

    // Send the auth details
    const cookies = Cookies.get();
    const filteredCookies = pickBy(cookies, (value, cookieName) => testCookieName(cookieName));

    websocket.send(JSON.stringify({
      type: 'AGGREGATION_PROCESSOR_REGISTER',
      auth: filteredCookies,
      organisationId: state.router.route.params.organisationId,
      aggregationProcessorId: id
    }));

    const createChannel = () => eventChannel((emitter) => {
      websocket.addEventListener('message', (message) => {
        const data = JSON.parse(message.data);
        const result = mapping(data.results);

        // put into the state
        emitter(successAction({
          pipeline,
          timeIntervalSinceToday,
          timeIntervalUnits,
          result
        }));
      });

      websocket.addEventListener('close', () => {
        emitter(END);
      });

      websocket.addEventListener('error', () => {
        emitter(END);
      });

      return () => {
        websocket.close();
      };
    });

    function* listenToWs() {
      const channel = yield call(createChannel);
      while (true) {
        const action = yield take(channel);
        yield put(action);
      }
    }
    yield fork(listenToWs);

    return;
  }
});

export const selectors = {
  aggregationRequestStateSelector,
  aggregationShouldFetchSelector
};

export const reducers = fetchAggregation.reducers;
export const actions = fetchAggregation.actions;
export const sagas = [...fetchAggregation.sagas];
