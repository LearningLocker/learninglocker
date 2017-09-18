import { Map, fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

const SET_STATEMENT_QUERY = 'learninglocker/statments/SET_STATEMENT_QUERY';

/*
 * Reducers
 */
const handler = handleActions({
  [SET_STATEMENT_QUERY]: (state, action) => {
    const { query } = action;
    return state.set('query', query);
  }
});

const initialState = fromJS({
  query: {}
});
export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(fromJS(state), action); // ensure immutability
  return handler(state, action);
}

/*
 * Actions
 */
export const updateStatementQuery = query => ({
  type: SET_STATEMENT_QUERY,
  query
});
export const actions = {
  updateStatementQuery
};

/*
 * Selectors
 */
export const statementQuerySelector = createSelector(
  [state => state],
  state => state.statements.get('query', new Map())
);

export const sagas = [];
