import { put, take, select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { handleActions } from 'redux-actions';
import Cookies from 'js-cookie';
import { pickBy, lowerCase, map } from 'lodash';
import { OrderedMap, Map } from 'immutable';
import { testCookieName } from 'ui/utils/auth';
import { BACKWARD } from 'ui/redux/modules/pagination/fetchModels';
import * as schemas from 'ui/utils/schemas';
import { normalize, arrayOf } from 'normalizr';
import entityReviver from 'ui/redux/modules/models/entityReviver';
import * as mergeEntitiesDuck from 'ui/redux/modules/models/mergeEntities';


/* Actions */

const INIT_WEBSOCKET = 'learninglocker/websocket/INIT_WEBSOCKET';
const WEBSOCKET_READY = 'learninglocker/websocket/WEBSOCKET_READY';
const REGISTER_ACTION = 'learninglocker/websocket/REGISTER_ACTION';
const WEBSOCKET_MESSAGE = 'learninglocker/websocket/WEBSOCKET_MESSAGE';

export const initWebsocketAction = () => ({
  type: INIT_WEBSOCKET,
});

export const websocketReady = ({ websocket }) => ({
  type: WEBSOCKET_READY,
  websocket
});

export const registerAction = ({ ...args }) => ({
  type: REGISTER_ACTION,
  ...args
});

export const websocketMessage = ({ ...args }) => ({
  type: WEBSOCKET_MESSAGE,
  ...args
});

function* initWebsocket() {
  const websocket = new WebSocket('ws://learninglocker:3000/websocket');

  // yield promisify(websocket.addEventListener, 'open');
  yield new Promise((resolve) => {
    websocket.addEventListener('open', () => {
      resolve();
    });
  });

  const cookies = Cookies.get();
  const filteredCookies = pickBy(cookies, (value, cookieName) => testCookieName(cookieName));

  websocket.send(JSON.stringify({
    type: 'authenticate',
    value: filteredCookies
  }));


  const channel = eventChannel((emmiter) => {
    websocket.addEventListener('message', (message) => {
      emmiter(websocketMessage({ message }));
    });

    return () => {
      // TODO, unsubscribe websocket;
    };
  });

  yield put(websocketReady({ websocket }));

  while (true) {
    const action = yield take(channel);
    yield put(action);
  }
}

function* handleWebsocketMessage() {
  while (true) {
    const { message } = yield take(WEBSOCKET_MESSAGE);

    const data = JSON.parse(message.data);

    // normalzr reviver
    const models = map(data.edges, item => item.node);
    const schemaClass = schemas[lowerCase(data.schema)];
    const normalizedModels = normalize(models, arrayOf(schemaClass));
    const entities = entityReviver(normalizedModels);
    // eo romalzr reviver

    yield put(mergeEntitiesDuck.actions.mergeEntitiesAction(entities));

    yield put({
      type: 'learninglocker/pagination/FETCH_MODELS_SUCCESS',
      cursor: new Map({
        before: data.before
      }),
      direction: BACKWARD,
      edges: map(data.edges, item => (new OrderedMap({ id: item.node._id, cursor: item.cursor }))),
      filter: new Map(),
      ids: map(models, '_id'),
      pageInfo: new Map({
        startCursor: data.cursor,
        endCursor: data.cursor,
        hasNextPage: false,
        hasPreviousPage: true,
      }),
      schema: 'statement',
      sort: new Map({ // TODO
        _id: 1,
        timestamp: -1
      })
    });
  }
}

const getAuth = () => {
  const cookies = Cookies.get();
  const filteredCookies = pickBy(cookies, (value, cookieName) => testCookieName(cookieName));
  return filteredCookies;
};

function* registerConnection() {
  // wait for the websocket to be ready
  yield take(WEBSOCKET_READY);

  while (true) {
    const {
      schema,
      filter,
      sort,
      direction,
      cursor // The start cursor that we are going before
    } = yield take(REGISTER_ACTION);
    const state = yield select();

    state.websocket.websocket.send(JSON.stringify({
      type: 'REGISTER',
      organisationId: state.router.route.params.organisationId,
      auth: getAuth(),
      schema,
      filter,
      sort,
      direction,
      cursor
    }));
  }
}

/* Reducers */

const handler = handleActions({
  [WEBSOCKET_READY]: (state, { websocket }) => {
    state.websocket = websocket;
    return state;
  }
});

export default function reducer(state = {}, action = {}) {
  return handler(state, action);
}

/* EO Reducers */

export const actions = { initWebsocketAction };
export const sagas = [
  initWebsocket,
  registerConnection,
  handleWebsocketMessage
];
// export const callbacks = { handleMessage };
