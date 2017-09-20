import { createSelector } from 'reselect';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import { fromJS, Map } from 'immutable';
import { takeEvery } from 'redux-saga/effects';
import { getCookieName, getCookieNameStartsWith } from 'ui/utils/auth';

/**
 * takes tokens received from the auth process
 * decodes them and stores the decoded version in redux state
 * stores the raw token in browser storage
 */
const stateSelector = (state) => {
  const out = state.auth;
  return out;
};

const authSelector = (tokenType = 'user', tokenId) => createSelector(
  stateSelector,
  (state) => {
    if (tokenType === 'user') {
      return state.getIn(['tokens', 'user'], new Map());
    }
    return state.getIn(['tokens', tokenType, tokenId], new Map());
  }
);
const authTokenSelector = (tokenType, tokenId) => createSelector(
  [authSelector(tokenType, tokenId)],
  authState => authState.get('token')
);

const activeTokenTypeIdSelector = createSelector(
  stateSelector,
  authState => ({ tokenType: authState.get('activeTokenType'), tokenId: authState.get('activeTokenId') })
);

const activeAuthSelector = createSelector(
  state => state,
  activeTokenTypeIdSelector,
  (state, { tokenType, tokenId }) => authSelector(tokenType, tokenId)(state)
);

const activeTokenSelector = createSelector(
  state => state,
  activeTokenTypeIdSelector,
  (state, { tokenType, tokenId }) => authTokenSelector(tokenType, tokenId)(state)
);

const getTypeFromDecodedToken = (decoded) => {
  if (decoded.tokenType) return decoded.tokenType;
  return 'user';
};

const getIdFromDecodedToken = (decoded) => {
  if (decoded.tokenId) return decoded.tokenId;
  return null;
};

const DECODE_LOGIN_TOKEN = 'learninglocker/auth/DECODE_LOGIN_TOKEN';
const decodeLoginTokenAction = (token) => {
  try {
    if (token) {
      const decoded = jwtDecode(token);
      const tokenId = getIdFromDecodedToken(decoded);
      const tokenType = getTypeFromDecodedToken(decoded);

      return { type: DECODE_LOGIN_TOKEN, token, decoded, tokenType, tokenId };
    }

    return {
      type: DECODE_LOGIN_TOKEN
    };
  } catch (err) {
    console.error(err);
    throw new Error('Could not decode the login token provided');
  }
};
const decodeLoginTokenReducer = (state, { tokenType, tokenId, decoded, token }) => {
  if (!token) return state;
  if (tokenType === 'user') {
    return state
      .setIn(['tokens', 'user'], fromJS(decoded))
      .setIn(['tokens', 'user', 'token'], token);
  }
  return state
      .setIn(['tokens', tokenType, tokenId], fromJS(decoded))
      .setIn(['tokens', tokenType, tokenId, 'token'], token);
};

const SET_ACTIVE_TOKEN = 'learninglocker/auth/SET_ACTIVE_TOKEN';
const setActiveTokenAction = (tokenType = 'user', tokenId) =>
  ({ type: SET_ACTIVE_TOKEN, tokenType, tokenId });

const setActiveTokenReducer = (state, { tokenType, tokenId }) => state
  .set('activeTokenType', tokenType)
  .set('activeTokenId', tokenId);

const getExistingOrgLoginAction = (organisationId) => {
  const cookieName = getCookieName({ tokenType: 'organisation', tokenId: organisationId });
  const token = Cookies.get(cookieName);
  return decodeLoginTokenAction(token);
};

const getExistingLoginAction = () => {
  const cookieName = getCookieNameStartsWith({ tokenType: 'user' }, Cookies.getJSON());

  const token = cookieName && Cookies.get(cookieName);
  return decodeLoginTokenAction(token);
};

function storeTokenSaga({ token, tokenType, tokenId }) {
  try {
    if (token) {
      const cookieName = getCookieName({ tokenType, tokenId });
      Cookies.set(cookieName, token);
    }
  } catch (err) {
    console.error(err);
    throw new Error('Failed to store token in browser cookie');
  }
}

function* watchStoreTokenSaga() {
  yield takeEvery(DECODE_LOGIN_TOKEN, storeTokenSaga);
}

export const selectors = {
  authSelector,
  authTokenSelector,
  activeTokenSelector,
  activeAuthSelector
};

export const reducers = {
  [DECODE_LOGIN_TOKEN]: decodeLoginTokenReducer,
  [SET_ACTIVE_TOKEN]: setActiveTokenReducer
};

export const actions = {
  setActiveTokenAction,
  decodeLoginTokenAction,
  getExistingOrgLoginAction,
  getExistingLoginAction
};

export const sagas = [
  watchStoreTokenSaga
];
