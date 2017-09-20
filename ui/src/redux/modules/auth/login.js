import { createSelector } from 'reselect';
import { put } from 'redux-saga/effects';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import basicAuth from 'popsicle-basic-auth';
import * as routes from 'lib/constants/routes';
import { post } from 'popsicle';
import { actions as routerActions } from 'redux-router5';
import { actions as tokenActions } from 'ui/redux/modules/auth/token';
import { openPopup, listenForToken } from 'ui/utils/oauth';

import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';

const authSelector = state => state.auth;

const loginRequestStateSelector = createSelector(
  [authSelector],
  auth => auth.get('loginRequestState', false)
);

const loginErrorSelector = createSelector(
  [authSelector],
  auth => auth.get('loginError')
);

const shouldLoginSelector = createSelector(
  [loginRequestStateSelector],
  loginState =>
    (loginState !== IN_PROGRESS && loginState !== COMPLETED && loginState !== FAILED)
);

const basicLogin = createAsyncDuck({
  actionName: 'learninglocker/auth/LOGIN',

  reduceStart: state => state.set('loginRequestState', IN_PROGRESS),
  reduceSuccess: state => state.set('loginRequestState', COMPLETED).set('loginError', null),
  reduceFailure: (state, { error }) => state.set('loginRequestState', FAILED).set('loginError', error.message),
  reduceComplete: state => state.set('loginRequestState', null),

  startAction: ({ username, password }) => ({ username, password }),
  successAction: () => ({}),
  failureAction: error => ({ error }),
  completeAction: () => ({}),
  checkShouldFire: (action, state) => shouldLoginSelector(state),

  doAction: function* loginSaga({ username, password }) {
    const { status, body } = yield post(`/api${routes.AUTH_JWT_PASSWORD}`)
      .use(basicAuth(username.toLowerCase(), password));
    if (status > 200 && status < 500) throw new Error(body.message || body);
    else if (status >= 500) throw new Error('There was an error communicating with the login server.');
    else {
      yield put(tokenActions.decodeLoginTokenAction(body));
      yield put(routerActions.navigateTo('home'));
    }
  }
});

const oauthLogin = createAsyncDuck({
  actionName: 'learninglocker/auth/OAUTH_LOGIN',

  reduceStart: state => state.set('loginRequestState', IN_PROGRESS),
  reduceSuccess: state => state.set('loginRequestState', COMPLETED).set('loginError', null),
  reduceFailure: (state, { error }) => state.set('loginRequestState', FAILED).set('loginError', error),
  reduceComplete: state => state.set('loginRequestState', null),

  startAction: provider => ({ provider }),
  successAction: () => ({}),
  failureAction: ({ error }) => ({ error }),
  completeAction: () => ({}),
  checkShouldFire: (action, state) => shouldLoginSelector(state),

  doAction: function* oauthLoginSaga({ provider }) {
    const popup = openPopup(provider);
    // wait for the oauth login flow to complete
    const jsonWebToken = yield listenForToken(popup);
    yield put(tokenActions.decodeLoginTokenAction(jsonWebToken));
    yield put(routerActions.navigateTo('home'));
  }
});

export const selectors = { loginErrorSelector, loginRequestStateSelector };
export const reducers = { ...basicLogin.reducers, ...oauthLogin.reducers };
export const actions = { basic: basicLogin.actions, oauth: oauthLogin.actions };
export const sagas = [...basicLogin.sagas, ...oauthLogin.sagas];
