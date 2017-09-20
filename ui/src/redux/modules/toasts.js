import { take, put, call, fork } from 'redux-saga/effects';
import { Map, fromJS } from 'immutable';
import { handleActions } from 'redux-actions';
import uuid from 'uuid';

export const TOAST = 'learninglocker/toast/TOAST';
export const TOAST_START = 'learninglocker/toast/TOAST_START';
export const TOAST_FINISH = 'learninglocker/toast/TOAST_FINISH';

/*
 * Reducers
 */
const handler = handleActions({
  [TOAST_START]: (state, action) => {
    const { keyPath, message } = action;
    return state.updateIn(keyPath, new Map(), toastState =>
      toastState.set('message', message)
     );
  },
  [TOAST_FINISH]: (state, action) => {
    const { keyPath } = action;
    return state.deleteIn(keyPath);
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
export const toast = message => ({
  type: TOAST,
  message
});

export const toastStart = (keyPath, message) => ({
  type: TOAST_START,
  keyPath,
  message
});

export const toastFinish = keyPath => ({
  type: TOAST_FINISH,
  keyPath
});

/*
 * Selectors
 */
export const toastSelector = state => state.toasts;

/*
* Sagas
*/
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function* toastSaga({ message }) {
  const keyPath = [uuid.v4()];
  yield put(toastStart(keyPath, message));
  yield call(delay, 10000);
  yield put(toastFinish(keyPath));
}

function* watchToastSaga() {
  while (__CLIENT__) {
    const action = yield take(TOAST);
    yield fork(toastSaga, { ...action });
  }
}

export const sagas = [watchToastSaga];
