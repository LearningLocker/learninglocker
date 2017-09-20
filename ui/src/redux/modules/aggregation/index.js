import { Map, fromJS } from 'immutable';
import { createSelector } from 'reselect';
import { handleActions } from 'redux-actions';
import * as fetchAggregationDuck from 'ui/redux/modules/aggregation/fetchAggregation';

export const SETIN_AGGREGATION_RESULT = 'learninglocker/aggregation/SETIN_AGGREGATION_RESULT';

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
export const aggregationSelector = state => state.aggregation;
export const aggregationRequestStateSelector = fetchAggregationDuck.selectors.aggregationRequestStateSelector;
export const aggregationShouldFetchSelector = fetchAggregationDuck.selectors.aggregationShouldFetchSelector;
export const aggregationResultsSelector = pipeline => createSelector(
  aggregationSelector,
  aggregations => aggregations.getIn([pipeline, 'result'])
);

/*
 * Sagas
 */
export const sagas = fetchAggregationDuck.sagas;
