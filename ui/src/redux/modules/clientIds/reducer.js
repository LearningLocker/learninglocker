import { Map } from 'immutable';
import { handleActions } from 'redux-actions';

import {
  ADD_MODEL_START,
  ADD_MODEL_SUCCESS,
  ADD_MODEL_FAILURE
} from 'ui/redux/modules/models';

const initialState = new Map();

/*
 * Reducers
 */
const handler = handleActions({
  [ADD_MODEL_START]: (state, action) => {
    const { clientId } = action;
    return state.set(clientId, clientId);
  },
  [ADD_MODEL_SUCCESS]: (state, action) => {
    const { clientId, serverId } = action;
    return state.set(clientId, serverId);
  },
  [ADD_MODEL_FAILURE]: (state, action) => {
    const { clientId } = action;
    return state.remove(clientId);
  }
});

export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(new Map(state), action); // ensure immutability
  return handler(state, action);
}
