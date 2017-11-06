import { Map, fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

const SET_IN_METADATA = 'learninglocker/metadata/SET_IN';
const DELETE_IN_METADATA = 'learninglocker/metadata/DELETE_IN';

/*
 * Reducers
 */
const handler = handleActions({
  [SET_IN_METADATA]: (state, action) => {
    const { schema, id, path, value } = action;
    return state.setIn([schema, id, ...path], value);
  },
  [DELETE_IN_METADATA]: (state, action) => {
    const { schema, id, path } = action;
    return state.deleteIn([schema, id, ...path]);
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
export const setInMetadata = ({ schema, id, path, value }) =>
  ({
    type: SET_IN_METADATA,
    schema,
    id,
    path,
    value,
  });

export const deleteInMetadata = ({ schema, id, path }) => ({
  type: DELETE_IN_METADATA,
  schema,
  id,
  path,
});

/*
 * Selectors
 */
export const metadataSelector = state => state.metadata;

export const getMetadataSelector = ({ schema, id }) => createSelector(
  [metadataSelector],
  state => state.getIn([schema, id], new Map())
);

export const sagas = [];
