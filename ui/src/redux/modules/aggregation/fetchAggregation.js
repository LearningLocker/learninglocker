import { OrderedMap, fromJS } from 'immutable';
import map from 'lodash/map';
import { createSelector } from 'reselect';
import { call } from 'redux-saga/effects';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { setReviver } from 'ui/utils/immutable';

export function defaultMapping(set) {
  return new OrderedMap(fromJS(map(set, value => ([value._id, value]))));
}

export function suggestionMapping(set) {
  return fromJS(map(set, 'result'), setReviver);
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

const fetchAggregaation = createAsyncDuck({
  actionName: 'learninglocker/aggregation/FETCH_AGGREGATION',
  failureDelay: 2000,

  reduceStart: (state, { pipeline }) => state
    .setIn([pipeline, 'requestState'], IN_PROGRESS),

  reduceSuccess: (state, { pipeline, result }) => state
    .setIn([pipeline, 'requestState'], COMPLETED)
    .setIn([pipeline, 'result'], result),

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
    const checkShouldFire = aggregationShouldFetchSelector(pipeline)(state);
    return checkShouldFire;
  },

  doAction: function* fetchAggregationSaga({ pipeline, mapping, llClient }) {
    const { body, status } = yield call(llClient.getAggregation, pipeline);
    if (status > 300) throw new Error(body.error);
    const result = mapping(body);
    // map the ids against the filter in the pagination store
    return yield { pipeline, result };
  }
});

export const selectors = {
  aggregationRequestStateSelector,
  aggregationShouldFetchSelector
};

export const reducers = fetchAggregaation.reducers;
export const actions = fetchAggregaation.actions;
export const sagas = fetchAggregaation.sagas;
