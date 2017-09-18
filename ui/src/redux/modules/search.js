import { Map, fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { modelsByFilterSelector } from 'ui/redux/modules/models';
import _ from 'lodash';

const SET_MODEL_QUERY = 'learninglocker/search/SET_MODEL_QUERY';

/*
 * Reducers
 */
const handler = handleActions({
  [SET_MODEL_QUERY]: (state, action) => {
    const { schema, query } = action;
    return state.setIn([schema, 'query'], query);
  }
});

const initialState = {};
export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(fromJS(state), action); // ensure immutability
  return handler(state, action);
}

/*
 * Actions
 */
export const setModelQuery = (schema, query) => ({
  type: SET_MODEL_QUERY,
  schema,
  query
});

/*
 * Selectors
 */
export const searchSelector = state => state.search;

export const modelQueryStringSelector = schema => createSelector(
  [searchSelector],
  search => search.getIn([schema, 'query'], '')
);

/**
 * Takes a string and turns it into a mongo query relevant to the schema provided
 * @param  {queryString} search string provided by a user
 * @param  {schema} model schema, e.g. 'user'
 * @return {Immutable.Map}
 */
export function queryStringToQuery(queryString, schema) {
  if (!queryString) return new Map();
  const escapedStr = _.escapeRegExp(queryString);
  switch (schema) {
    case 'persona': return fromJS(
      { name: { $regex: escapedStr, $options: 'i' } }
    );
    case 'user': return fromJS({
      $or: [
        { name: { $regex: escapedStr, $options: 'i' } },
        { email: { $regex: escapedStr, $options: 'i' } }
      ]
    });
    case 'organisation': return fromJS(
      { name: { $regex: escapedStr, $options: 'i' } }
    );
    case 'client': return fromJS(
      { title: { $regex: escapedStr, $options: 'i' } }
    );
    case 'lrs': return fromJS({
      $or: [
        { title: { $regex: escapedStr, $options: 'i' } },
        { description: { $regex: escapedStr, $options: 'i' } }
      ]
    });
    default: return fromJS(
      { description: { $regex: escapedStr, $options: 'i' } }
    );
  }
}

/**
 * Takes a schema and returns the full default query
 * @param  {schema} schema of the models to fetch, e.g. 'user'
 * @return {Immutable.Map}
 */
export const currentQuerySelector = schema => createSelector(
  [modelQueryStringSelector(schema)],
  queryString => queryStringToQuery(queryString, schema)
);

/**
 * Takes a schema and returns the models from it's current query
 * @param  {schema} schema of the models to fetch, e.g. 'user'
 * @return {Immutable.Map}
 */
export const modelsByCurrentQuerySelector = schema => createSelector(
  [state => state,
    currentQuerySelector(schema)],
  (state, query) => modelsByFilterSelector(schema, query)(state)
);

export const sagas = [];
