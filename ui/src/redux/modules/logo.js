import { take, put, call } from 'redux-saga/effects';
import { Map } from 'immutable';
import { handleActions } from 'redux-actions';
import { toast } from './toasts';

export const UPLOAD_LOGO = 'learninglocker/logo/UPLOAD_LOGO';
export const UPLOAD_LOGO_SUCCESS = 'learninglocker/logo/UPLOAD_LOGO_SUCCESS';
export const UPLOAD_LOGO_FAILURE = 'learninglocker/logo/UPLOAD_LOGO_FAILURE';
export const UPLOAD_LOGO_DONE = 'learninglocker/logo/UPLOAD_LOGO_DONE';
export const UPLOAD_LOGO_UPDATE = 'learninglocker/logo/UPLOAD_LOGO_UPDATE';

export const IN_PROGRESS = 'learninglocker/logo/IN_PROGRESS';
export const SUCCESS = 'learninglocker/logo/SUCCESS';
export const FAILED = 'learninglocker/logo/FAILED';
export const NOT_UPLOADING = 'learninglocker/logo/NOT_UPLOADING';

const initialState = {};

/*
 * Reducers
 */

const handler = handleActions({
  [UPLOAD_LOGO]: (state, action) => {
    const { schema, id } = action;
    return state.setIn([schema, id, 'uploadState'], IN_PROGRESS);
  },
  [UPLOAD_LOGO_FAILURE]: (state, action) => {
    const { schema, id } = action;
    return state.setIn([schema, id, 'uploadState'], FAILED);
  },
  [UPLOAD_LOGO_SUCCESS]: (state, action) => {
    const { schema, id } = action;
    return state.setIn([schema, id, 'uploadState'], SUCCESS);
  },
  [UPLOAD_LOGO_UPDATE]: (state, action) => {
    const { schema, id, body } = action;
    return state.setIn([schema, id, 'logoPath'], body);
  },
  [UPLOAD_LOGO_DONE]: (state, action) => {
    const { schema, id } = action;
    return state.setIn([schema, id, 'uploadState'], null);
  },
});

export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(new Map(state), action); // ensure immutability
  return handler(state, action);
}


/*
 * Actions
 */

export const uploadLogo = (schema, id, file) => ({
  type: UPLOAD_LOGO,
  schema,
  id,
  file
});

export const uploadLogoSuccess = (schema, id) => ({
  type: UPLOAD_LOGO_SUCCESS,
  schema,
  id
});

export const uploadLogoUpdate = (schema, id, body) => ({
  type: UPLOAD_LOGO_UPDATE,
  schema,
  id,
  body
});

export const uploadLogoFailure = (schema, id) => ({
  type: UPLOAD_LOGO_FAILURE,
  schema,
  id
});

export const uploadLogoDone = (schema, id) => ({
  type: UPLOAD_LOGO_DONE,
  schema,
  id
});

/*
 * Sagas
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function* uploadLogoSaga() {
  while (true) {
    const { schema, id, file, llClient } = yield take(UPLOAD_LOGO);
    const { body, status } = yield call(llClient.uploadLogo, file, id);

    if (status > 200 && status < 500 || body === null) {
      yield put(uploadLogoFailure(schema, id));
      yield put(toast(body));
      yield call(delay, 2000); // shows success state for 2 seconds
      yield put(uploadLogoDone(schema, id));
    } else if (status >= 500) {
      yield put(uploadLogoFailure(schema, id));
      yield call(delay, 2000); // shows success state for 2 seconds
      yield put(uploadLogoDone(schema, id));
    } else {
      yield put(uploadLogoSuccess(schema, id, body));
      yield call(delay, 500);
      yield put(uploadLogoUpdate(schema, id, body));
      yield call(delay, 2000); // shows success state for 2 seconds
      yield put(uploadLogoDone(schema, id));
    }
  }
}

/*
 * Selectors
 */
export const exportSelector = state => state.logo;

export const sagas = [uploadLogoSaga];
