import { Map, fromJS } from 'immutable';
import reduceReducers from 'reduce-reducers';
import * as fetchModelsDuck from 'ui/redux/modules/pagination/fetchModels';
import * as fetchModelsCountDuck from 'ui/redux/modules/pagination/fetchModelsCount';
import * as clearModelsCacheDuck from 'ui/redux/modules/pagination/clearModelsCache';

/*
 * Reducers
 */
const handler = reduceReducers(
  fetchModelsCountDuck.reducer,
  fetchModelsDuck.reducer,
  clearModelsCacheDuck.reducer
);
const initialState = new Map();
export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(fromJS(state), action); // ensure immutability
  return handler(state, action);
}


/*
 * Actions
 */
export const clearModelsCache = clearModelsCacheDuck.actions.clearModelsCache;
export const fetchModels = fetchModelsDuck.actions.start;
export const fetchMore = fetchModelsDuck.actions.fetchMore;
export const fetchModelsCount = fetchModelsCountDuck.actions.start;
export const fetchAllOutstandingModels = fetchModelsDuck.actions.fetchAllOutstandingModels;

/*
 * Selectors
 */
export const idsByFilterSelector = fetchModelsDuck.selectors.idsByFilterSelector;
export const hasMoreSelector = fetchModelsDuck.selectors.hasMoreSelector;
export const isLoadingSelector = fetchModelsDuck.selectors.isLoadingSelector;
export const shouldFetchSelector = fetchModelsDuck.selectors.shouldFetchSelector;
export const cursorSelector = fetchModelsDuck.selectors.cursorSelector;

export const countSelector = fetchModelsCountDuck.selectors.countSelector;
export const shouldFetchCountSelector = fetchModelsCountDuck.selectors.shouldFetchCountSelector;
export const isLoadingCountSelector = fetchModelsCountDuck.selectors.isLoadingCountSelector;

/*
 * Sagas
 */
export const sagas = [...fetchModelsDuck.sagas, ...fetchModelsCountDuck.sagas];
