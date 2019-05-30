import { Map, fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

const SET_STATEMENT_QUERY = 'learninglocker/statements/SET_STATEMENT_QUERY';
const SET_STATEMENT_TIMEZONE = 'learninglocker/statements/SET_STATEMENT_TIMEZONE';

/*
 * Reducers
 */
const handler = handleActions({
  [SET_STATEMENT_QUERY]: (state, action) =>
    state.set('query', action.query),
  [SET_STATEMENT_TIMEZONE]: (state, action) =>
    state.set('timezone', action.timezone)
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
export const updateStatementTimezone = timezone => ({
  type: SET_STATEMENT_TIMEZONE,
  timezone
});
export const actions = {
  updateStatementQuery,
  updateStatementTimezone,
};

/*
 * Selectors
 */
export const statementQuerySelector = createSelector(
  [state => state],
  state => state.statements.get('query', new Map())
);
export const statementTimezoneSelector = createSelector(
  [state => state],
  state => state.statements.get('timezone')
);

export const sagas = [];
