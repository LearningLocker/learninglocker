import { take, put, call } from 'redux-saga/effects';
import { alert } from 'ui/redux/modules/alerts';
import { Map } from 'immutable';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

const REQUEST_APP_ACCESS = 'learninglocker/REQUEST_APP_ACCESS';
const REQUEST_APP_ACCESS_SUCCESS = 'learninglocker/REQUEST_APP_ACCESS_SUCCESS';
const REQUEST_APP_ACCESS_FAILURE = 'learninglocker/REQUEST_APP_ACCESS_FAILURE';

const IN_PROGRESS = 'IN_PROGRESS';
const COMPLETED = 'COMPLETED';
const FAILED = 'FAILED';

const rootSelector = state => state.requestAppAccess;

export const requestStateSelector = () => createSelector(
  rootSelector,
  state =>
    state.getIn(['requestState'])
);

export const requestAppAccess = ({ appConfig }) =>
  ({
    type: REQUEST_APP_ACCESS,
    appConfig,
  });

export const requestAppAccessSuccess = () =>
  ({
    type: REQUEST_APP_ACCESS_SUCCESS,
  });

export const requestAppAccessFailure = () =>
  ({
    type: REQUEST_APP_ACCESS_FAILURE,
  });

function* requestAppAccessSaga() {
  while (true) {
    const { appConfig, llClient } = yield take(REQUEST_APP_ACCESS);
    const { status } = yield call(llClient.requestAppAccess, {
      appConfig
    });

    if (status >= 300) {
      yield put(requestAppAccessFailure());
      yield put(alert({
        message: 'Access request failed, check email configuration'
      }));
    } else {
      yield put(requestAppAccessSuccess());
    }
  }
}

const handler = handleActions({
  [REQUEST_APP_ACCESS]: state =>
    state.setIn(['requestState'], IN_PROGRESS),
  [REQUEST_APP_ACCESS_SUCCESS]: (state) => {
    const out = state.setIn(['requestState'], COMPLETED);
    return out;
  },
  [REQUEST_APP_ACCESS_FAILURE]: (state) => {
    const out = state.setIn(['requestState'], FAILED);
    return out;
  }
});

const initialState = {};
export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(new Map(state), action); // ensure immutability
  return handler(state, action);
}

export const sagas = [
  requestAppAccessSaga
];
