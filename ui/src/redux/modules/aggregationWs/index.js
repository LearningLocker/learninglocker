import { Map, OrderedMap, fromJS } from 'immutable';
import { createSelector } from 'reselect';
import { handleActions } from 'redux-actions';
import { SETIN_AGGREGATION_RESULT } from 'ui/redux/modules/aggregation';
import * as fetchAggregationDuck from 'ui/redux/modules/aggregationWs/fetchAggregation';
import { get } from 'lodash';

/*
 * Reducers
 */
const handler = handleActions({
  ...fetchAggregationDuck.reducers,
  [SETIN_AGGREGATION_RESULT]: (state, action) => {
    const { keyPath, value } = action;
    return state.setIn(keyPath, value);
  }
});

const initialState = new Map();
export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(fromJS(state), action); // ensure immutability
  return handler(state, action);
}

/*
 * Actions
 */
export const setInAggregationResult = (keyPath, value) => ({
  type: SETIN_AGGREGATION_RESULT,
  keyPath,
  value
});

export const fetchAggregation = fetchAggregationDuck.actions.start;

/*
 * Selectors
 */
export const aggregationSelector = state => state.aggregationWs;
export const aggregationRequestStateSelector = fetchAggregationDuck.selectors.aggregationRequestStateSelector;
export const aggregationShouldFetchSelector = fetchAggregationDuck.selectors.aggregationShouldFetchSelector;
export const aggregationResultsSelector = pipeline => createSelector(
  aggregationSelector,
  aggregations => aggregations.getIn([pipeline, 'result'])
);

export const aggregationHasResultSelector = pipeline => createSelector(
  aggregationSelector,
  aggregations => OrderedMap.isOrderedMap(aggregations.getIn([pipeline, 'result']))
);

export const aggregationWsResultsSelector = (pipeline, timeInterval) => {
  const out = createSelector(
    aggregationSelector,
    (aggregations) => {
      const ou = aggregations.getIn([
        new Map({
          pipeline,
          timeIntervalSinceToday: get(timeInterval, 'timeIntervalSinceToday'),
          timeIntervalUnits: get(timeInterval, 'timeIntervalUnits')
        }),
        'result'
      ]);
      return ou;
    }
  );
  return out;
};

/*
 * Sagas
 */
export const sagas = fetchAggregationDuck.sagas;
