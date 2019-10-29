import { OrderedMap, Map, fromJS } from 'immutable';
import { createSelector } from 'reselect';
import { call, put, select, take, fork } from 'redux-saga/effects';
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
      timeIntervalUnits: get(timeInterval, 'timeIntervalUnits'),
      ...(get(timeInterval, 'timeIntervalSincePreviousTimeInterval') ?
        { timeIntervalSincePreviousTimeInterval: get(timeInterval, 'timeIntervalSincePreviousTimeInterval') } :
        {}
      )
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

const fetchAggregation = createAsyncDuck({
  actionName: 'learninglocker/aggregation/FETCH_AGGREGATION_WS',
  failureDelay: 2000,

  reduceStart: (state, { pipeline, timeIntervalSinceToday, timeIntervalUnits, timeIntervalSincePreviousTimeInterval }) => {
    const out = state
      .setIn([new Map({
        pipeline,
        timeIntervalSinceToday,
        timeIntervalUnits,
        ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {})
      }), 'requestState'], IN_PROGRESS);
    return out;
  },

  reduceSuccess: (state, {
    pipeline,
    timeIntervalSinceToday,
    timeIntervalUnits,
    timeIntervalSincePreviousTimeInterval,
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
        ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {})
      }), 'requestState'], COMPLETED);

    if (result.get('result') === null) {
      return x;
    }

    const out = x.setIn([new Map({
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {})
    }), 'result'], result.getIn(['result']));

    return out;
  },

  reduceFailure: (state, {
    pipeline,
    timeIntervalSinceToday,
    timeIntervalUnits,
    timeIntervalSincePreviousTimeInterval,
    err
  }) => state
    .setIn([new Map({
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {})
    }), 'requestState'], FAILED)
    .setIn([new Map({
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {})
    }), 'error'], err),

  reduceComplete: (state, {
    pipeline,
    timeIntervalSinceToday,
    timeIntervalUnits,
    timeIntervalSincePreviousTimeInterval
  }) => {
    const out = state
    .setIn([new Map({
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      ...(timeIntervalSincePreviousTimeInterval ? { timeIntervalSincePreviousTimeInterval } : {})
    }), 'requestState'], COMPLETED);
    return out;
  },

  startAction: ({
    pipeline,
    mapping = defaultMapping,
    timeIntervalSinceToday,
    timeIntervalUnits,
    timeIntervalSincePreviousTimeInterval
  }) => {
    const out = ({
      pipeline,
      mapping,
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval
    });
    return out;
  },

  successAction: (args) => {
    if (!args) {
      return {};
    }
    const { pipeline, timeIntervalSinceToday, timeIntervalUnits, timeIntervalSincePreviousTimeInterval, result, sinceAt } = args;
    const out = ({ pipeline, timeIntervalSinceToday, timeIntervalUnits, timeIntervalSincePreviousTimeInterval, result, sinceAt });
    return out;
  },

  failureAction: args => args,

  completeAction: args => args,

  checkShouldFire: ({
    pipeline,
    timeIntervalSinceToday,
    timeIntervalUnits,
    timeIntervalSincePreviousTimeInterval
  }, state) => {
    const shouldFetch = aggregationShouldFetchSelector(pipeline, {
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval
    })(state);
    return shouldFetch;
  },

  doAction: function* fetchAggregationSaga({
    pipeline,
    llClient,
    timeIntervalSinceToday,
    timeIntervalUnits,
    timeIntervalSincePreviousTimeInterval,
    successAction,
    mapping
  }) {
    const { body } = yield call(
      llClient.aggregateWs,
      pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval
    );
    yield put(successAction({ pipeline,
      timeIntervalSinceToday,
      timeIntervalUnits,
      timeIntervalSincePreviousTimeInterval,
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
          timeIntervalSincePreviousTimeInterval,
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
