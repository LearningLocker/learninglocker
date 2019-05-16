import { OrderedMap, Map, fromJS } from 'immutable';
import { createSelector } from 'reselect';
import moment from 'moment';
import { call, put, takeEvery } from 'redux-saga/effects';
import { delay } from 'bluebird';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';

export function defaultMapping(body) {
  return new Map({
    result: body.result && new OrderedMap(body.result.map(v => fromJS([v._id, v]))),
    startedAt: body.status.startedAt,
    completedAt: body.status.completedAt,
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
  actionName: 'learninglocker/aggregation/FETCH_AGGREGATION',
  failureDelay: 2000,

  reduceStart: (state, { pipeline }) => state
    .setIn([pipeline, 'requestState'], IN_PROGRESS),

  reduceSuccess: (state, { pipeline, result }) => {
    const x = state
      .setIn([pipeline, 'requestState'], COMPLETED)
      .setIn([pipeline, 'startedAt'], result.get('startedAt'))
      .setIn([pipeline, 'completedAt'], result.get('completedAt'));

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

  startAction: ({ pipeline, mapping = defaultMapping, sinceAt }) => ({ pipeline, mapping, sinceAt }),

  successAction: ({ pipeline, result, sinceAt }) => ({ pipeline, result, sinceAt }),

  failureAction: ({ pipeline, err }) => ({ pipeline, err }),

  completeAction: ({ pipeline }) => ({ pipeline }),

  checkShouldFire: ({ pipeline }, state) => {
    const shouldFetch = aggregationShouldFetchSelector(pipeline)(state);
    const shouldRecall = aggregationShouldRecallSelector(pipeline)(state);
    return shouldFetch || shouldRecall;
  },

  doAction: function* fetchAggregationSaga({ pipeline, mapping, llClient, sinceAt }) {
    const { body } = yield call(llClient.aggregateAsync, pipeline, undefined, sinceAt);
    const result = mapping(body);

    return yield { pipeline, result, sinceAt };
  }
});

function* recallAggregationIfRequired(args) {
  const pipeline = args.pipeline;
  const sinceAt = args.sinceAt;
  const result = args.result.get('result');
  const startedAt = args.result.get('startedAt');
  const completedAt = args.result.get('completedAt');

  // Cached and is running
  const cachedAndIsRunning = startedAt && completedAt && moment(completedAt).isBefore(moment(startedAt));
  if (cachedAndIsRunning) {
    yield call(delay, 1000);
    yield put(fetchAggregation.actions.start({ pipeline, sinceAt: completedAt }));
    return;
  }

  // No cache
  if (result === null) {
    yield call(delay, 1000);
    yield put(fetchAggregation.actions.start({ pipeline, sinceAt }));
    return;
  }
}

function* watchAggregationSuccess() {
  if (__CLIENT__) yield takeEvery(fetchAggregation.constants.success, recallAggregationIfRequired);
}

export const selectors = {
  aggregationRequestStateSelector,
  aggregationShouldFetchSelector
};

export const reducers = fetchAggregation.reducers;
export const actions = fetchAggregation.actions;
export const sagas = [...fetchAggregation.sagas, watchAggregationSuccess];
