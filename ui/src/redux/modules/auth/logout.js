import { takeEvery, put } from 'redux-saga/effects';
import { actions as routerActions } from 'redux-router5';
import { Map } from 'immutable';
import Cookies from 'js-cookie';
import { each, pickBy } from 'lodash';
import { testCookieName } from 'ui/utils/auth';

export const LOGOUT = 'learninglocker/auth/LOGOUT';

const logoutAction = () => ({ type: LOGOUT });

/**
 * removes the user token and all registered org tokens from state
 * this effectively logs the user out
 */
const logoutReducer = state => state.set('tokens', new Map());

/**
 * removes all auth cookies from the browser
 */
function* logoutSaga() {
  try {
    const cookies = Cookies.get();
    const filteredCookies = pickBy(cookies, (value, cookieName) => testCookieName(cookieName));
    each(filteredCookies, (value, name) => Cookies.remove(name));
    yield put(routerActions.navigateTo('login'));
  } catch (err) {
    console.error(err);
    throw new Error('Failed to remove auth cookies from browser storage');
  }
}

function* watchLogoutSaga() {
  yield takeEvery(LOGOUT, logoutSaga);
}

export const selectors = {};
export const reducers = { [LOGOUT]: logoutReducer };
export const actions = { logoutAction };
export const sagas = [watchLogoutSaga];
