import { take, put, call } from 'redux-saga/effects';
import { alert } from 'ui/redux/modules/alerts';

const REQUEST_APP_ACCESS = 'learninglocker/REQUEST_APP_ACCESS';
const REQUEST_APP_ACCESS_SUCCESS = 'learninglocker/REQUEST_APP_ACCESS_SUCCESS';
const REQUEST_APP_ACCESS_FAILURE = 'learninglocker/REQUEST_APP_ACCESS_FAILURE';

export const requestAppAccess = ({ privacyPolicy, appName }) =>
  ({
    type: REQUEST_APP_ACCESS,
    privacyPolicy,
    appName
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
    const { privacyPolicy, appName, llClient } = yield take(REQUEST_APP_ACCESS);
    const { body, status } = yield call(llClient.requestAppAccess, {
      privacyPolicy,
      appName
    });

    if (status > 200) {
      yield put(requestAppAccessFailure({ body }));
      yield put(alert({
        message: 'Access request failed, check email configuration'
      }));
    } else {
      yield put(requestAppAccessSuccess({ body }));
    }
  }
}

export const sagas = [
  requestAppAccessSaga,
];
