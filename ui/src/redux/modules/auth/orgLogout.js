import { takeEvery, put } from 'redux-saga/effects';
import { actions as routerActions } from 'redux-router5';
import Cookies from 'js-cookie';
import { each, pickBy } from 'lodash';
import { testOrgCookieName } from 'ui/utils/auth';

export const ORG_LOGOUT = 'learninglocker/auth/ORG_LOGOUT';

const orgLogoutAction = () => ({ type: ORG_LOGOUT });

/**
 * Removes the user token and all registered org tokens from state
 * this effectively logs the user out
 */
const logoutReducer = (state, { organisationId }) => {
  if (organisationId) {
    return state.deleteIn(['tokens', 'organisation', organisationId]);
  }
  return state.deleteIn('tokens', 'organisation');
};

/**
 * Removes all auth cookies from the browser
 */
function* orgLogoutSaga({ organisationId }) {
  try {
    const cookies = Cookies.get();
    const testCookie = testOrgCookieName(organisationId);
    const filteredCookies = pickBy(cookies, (value, cookieName) => testCookie(cookieName));
    each(filteredCookies, (value, name) => Cookies.remove(name));
    yield put(routerActions.navigateTo('home'));
  } catch (err) {
    throw new Error('Failed to remove auth cookies from browser storage');
  }
}

function* watchOrgLogoutSaga() {
  yield takeEvery(ORG_LOGOUT, orgLogoutSaga);
}

export const selectors = {};
export const reducers = { [ORG_LOGOUT]: logoutReducer };
export const actions = { orgLogoutAction };
export const sagas = [watchOrgLogoutSaga];
