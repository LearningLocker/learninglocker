import { take, put } from 'redux-saga/effects';
import { Map, fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { ADD_MODEL_SUCCESS, modelsSchemaIdSelector } from 'ui/redux/modules/models';
import { initialSections } from 'ui/redux/modules/queryBuilder';

export const QUERY_SET_SELECTED_ID = 'learninglocker/query/QUERY_SET_SELECTED_ID';
export const QUERY_CHANGE_SECTIONS = 'learninglocker/query/QUERY_CHANGE_SECTIONS';

/*
 * Reducers
 */
const handler = handleActions({
  [QUERY_SET_SELECTED_ID]: (state, action) => {
    const { keyPath, selectedId } = action;
    return state.setIn([keyPath, 'selectedId'], selectedId);
  },
  [QUERY_CHANGE_SECTIONS]: (state, action) => {
    const { keyPath, sections } = action;
    return state.setIn(keyPath.push('sections'), sections);
  },
});

const initialState = {};
export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(fromJS(state), action); // ensure immutability
  return handler(state, action);
}

/*
 * Actions
 */
export const querySetSelectedId = (keyPath, selectedId) => ({
  type: QUERY_SET_SELECTED_ID,
  keyPath,
  selectedId
});

export const queryChangeSections = (keyPath, sections) => ({
  type: QUERY_CHANGE_SECTIONS,
  keyPath,
  sections
});

/*
 * Selectors
 */
export const queriesSelector = state => state.queries;
export const queriesSelectedIdSelector = keyPath => createSelector(
  [queriesSelector],
  queryState => queryState.getIn([keyPath, 'selectedId'], 'selectedId')
);
export const queriesSelectedModelSelector = keyPath => createSelector(
  [state => state, queriesSelectedIdSelector(keyPath)],
  (state, queryId) => modelsSchemaIdSelector('query', queryId)(state)
);
export const queriesSectionsSelector = keyPath => createSelector(
  [queriesSelector],
  queryState => queryState.getIn(keyPath.push('sections'), initialSections)
);

/*
 * Sagas
 */
function* queryWatchAddModelSaga() {
  while (__CLIENT__) {
    const { schema, keyPath, id } = yield take(ADD_MODEL_SUCCESS);
    if (keyPath && schema === 'query') yield put(querySetSelectedId(keyPath, id));
  }
}

export const sagas = [queryWatchAddModelSaga];
