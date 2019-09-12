import { OrderedMap, Map, fromJS } from 'immutable';
import { createSelector } from 'reselect';
import moment from 'moment';
import { call, put, takeEvery, select } from 'redux-saga/effects';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { getAppDataSelector } from 'ui/redux/modules/app';
import Cookies from 'js-cookie';
import { pickBy } from 'lodash';
import { testCookieName } from 'ui/utils/auth';

export function defaultMapping(body) {
  return new Map({
    result: body.result && new OrderedMap(body.result.map(v => fromJS([v._id, v]))),
  });
}

const aggregationSelector = state => state.aggregation;

const aggregationRequestStateSelector = pipeline => createSelector(
  aggregationSelector,
  aggregations => aggregations.getIn([pipeline, 'requestState'])
);

const aggregationShouldFetchSelector = pipeline => createSelector(
  aggregationRequestStateSelector(pipeline),
  requestState => (
      requestState !== IN_PROGRESS &&
      requestState !== COMPLETED &&
      requestState !== FAILED
    )
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

  reduceStart: (state, { pipeline }) => state
    .setIn([pipeline, 'requestState'], IN_PROGRESS),

  reduceSuccess: (state, { pipeline, result }) => {
    const x = state
      .setIn([pipeline, 'requestState'], COMPLETED);

    if (result.get('result') === null) {
      return x;
    }

    return x.setIn([pipeline, 'result'], result.get('result'));
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

  successAction: ({ pipeline, result, sinceAt }) => ({ pipeline, result, sinceAt }),

  failureAction: ({ pipeline, err }) => ({ pipeline, err }),

  completeAction: ({ pipeline }) => ({ pipeline }),

  checkShouldFire: ({ pipeline }, state) => {
    const shouldFetch = aggregationShouldFetchSelector(pipeline)(state);
    const shouldRecall = aggregationShouldRecallSelector(pipeline)(state);
    return shouldFetch || shouldRecall;
  },

  doAction: function* fetchAggregationSaga({
    pipeline,
    llClient,
    timeIntervalSinceToday,
    timeIntervalUnits,
  }) {
    // const pipelineWithoutTime = pipeline.shift(); // DEBUG ONLY, the pipeline should be correct when it comes in.
    const { body } = yield call(llClient.aggregateWs, pipeline, timeIntervalSinceToday, timeIntervalUnits);

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


    yield new Promise(() => {
      websocket.addEventListener('message', (message) => {
        console.log('002 message', message);
      });
    }); // TODO: close ws, hadle cleanup

    return yield { pipeline, result };
  }
});

export const selectors = {
  aggregationRequestStateSelector,
  aggregationShouldFetchSelector
};

export const reducers = fetchAggregation.reducers;
export const actions = fetchAggregation.actions;
export const sagas = [...fetchAggregation.sagas];
