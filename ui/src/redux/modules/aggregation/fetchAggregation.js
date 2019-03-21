import { OrderedMap, Map, fromJS } from 'immutable';
import { createSelector } from 'reselect';
import { call, put, takeEvery } from 'redux-saga/effects';
import delay from 'lib/helpers/delay';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';

export function defaultMapping(body) {
  return new Map({
    results: body.results && new OrderedMap(body.results.map(v => fromJS([v._id, v]))),
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
    const completedAt = aggregations.getIn([pipeline, 'completedAt']);
    return requestState !== IN_PROGRESS && completedAt === null;
  }
);

const fetchAggregation = createAsyncDuck({
  actionName: 'learninglocker/aggregation/FETCH_AGGREGATION',
  failureDelay: 2000,

  reduceStart: (state, { pipeline }) => state
    .setIn([pipeline, 'requestState'], IN_PROGRESS),

  reduceSuccess: (state, { pipeline, result }) => state
    .setIn([pipeline, 'requestState'], COMPLETED)
    .setIn([pipeline, 'result'], result.get('results'))
    .setIn([pipeline, 'startedAt'], result.get('startedAt'))
    .setIn([pipeline, 'completedAt'], result.get('completedAt')),

  reduceFailure: (state, { pipeline, err }) => state
    .setIn([pipeline, 'requestState'], FAILED)
    .setIn([pipeline, 'error'], err),

  reduceComplete: (state, { pipeline }) => state
    .setIn([pipeline, 'requestState'], COMPLETED),

  startAction: ({ pipeline, mapping = defaultMapping }) => ({ pipeline, mapping }),

  successAction: ({ pipeline, result }) => ({ pipeline, result }),

  failureAction: ({ pipeline, err }) => ({ pipeline, err }),

  completeAction: ({ pipeline }) => ({ pipeline }),

  checkShouldFire: ({ pipeline }, state) => {
    const shouldFetch = aggregationShouldFetchSelector(pipeline)(state);
    const shouldRecall = aggregationShouldRecallSelector(pipeline)(state);
    return shouldFetch || shouldRecall;
  },

  doAction: function* fetchAggregationSaga({ pipeline, mapping, llClient }) {
    const { body } = yield call(llClient.aggregateAsync, pipeline);
    const result = mapping(body);

    return yield { pipeline, result };
  }
});

function* recallAggregationIfRequired(args) {
  const pipeline = args.pipeline;
  const completedAt = args.result.get('completedAt');
  if (completedAt === null) {
    yield call(delay, 1000);
    yield put(fetchAggregation.actions.start({ pipeline }));
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
