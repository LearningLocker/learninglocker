import { handleActions } from 'redux-actions';
import { Map, fromJS } from 'immutable';
import { createSelector } from 'reselect';

const SET_WEBSOCKET = 'learninglocker/websocket/SET_WEBSOCKET';
const CLOSED_WEBSOCKET = 'learninglocker/websocket/CLOSED_WEBSOCKET';

/*
 * Reducers
 */
const handler = handleActions({
  [SET_WEBSOCKET]: (state, { websocket }) => {
    const newState = state.set('websocket', websocket);
    return newState;
  },
  [CLOSED_WEBSOCKET]: () => new Map(),
});

const initialState = {};
export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(fromJS(state), action); // ensure immutability
  return handler(state, action);
}

export const setWebsocketAction = ({
  websocket
}) => ({
  type: SET_WEBSOCKET,
  websocket
});

export const websocketClosedAction = () => ({
  type: CLOSED_WEBSOCKET
});

/*
 * Selectors
 */
export const websocketSelector = state => state.websocket.get('websocket');

export const getAppDataSelector = key => createSelector(
  [websocketSelector],
  state => state.get(key, new Map())
);
