import { handleActions } from 'redux-actions';
import moment from 'moment';
import { Iterable } from 'immutable';

const CLEAR_MODELS_CACHE = 'learninglocker/pagination/CLEAR_MODELS_CACHE';

/**
 * REDUCERS
 */
const clearCachedAtRecursive = (state) => {
  if (!Iterable.isIterable(state)) return state;
  if (state.has('cachedAt')) {
    return state.set('cachedAt', moment(0)).map(clearCachedAtRecursive);
  }
  return state.map(clearCachedAtRecursive);
};

const clearCountCachedAtRecursive = (state) => {
  if (!Iterable.isIterable(state)) return state;
  if (state.has('countCachedAt')) {
    return state.set('countCachedAt', moment(0)).map(clearCountCachedAtRecursive);
  }
  return state.map(clearCountCachedAtRecursive);
};


/**
 * sets the cachedAt time to a period in the past
 * this will force a refetch of the models when they are next requested
 */
const reduceClearCache = (state, { schema }) => {
  const postClear = state
    .update(schema, clearCachedAtRecursive)
    .update(schema, clearCountCachedAtRecursive);
  return postClear;
};

/**
 * ACTIONS
 */
const clearModelsCache = ({ schema, filter = new Map() }) => ({
  type: CLEAR_MODELS_CACHE,
  filter,
  schema
});

/**
 * SELECTORS
 */

export const selectors = { };
export const reducer = handleActions({
  [CLEAR_MODELS_CACHE]: reduceClearCache
});
export const actions = { clearModelsCache };
export const sagas = [];
