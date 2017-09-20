import { createSelector } from 'reselect';
import { put, select } from 'redux-saga/effects';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import * as routes from 'lib/constants/routes';
import { post } from 'popsicle';
import { actions as routerActions } from 'redux-router5';
import {
  selectors as tokenSelectors,
  actions as tokenActions
} from 'ui/redux/modules/auth/token';

export const IN_PROGRESS = 'IN_PROGRESS';
export const COMPLETED = 'COMPLETED';
export const FAILED = 'FAILED';

const authSelector = state => state.auth;

const loginRequestStateSelector = createSelector(
  [authSelector],
  auth => auth.get('orgLoginRequestState', false)
);

const shouldLoginSelector = createSelector(
  [loginRequestStateSelector],
  loginState =>
    (loginState !== IN_PROGRESS && loginState !== COMPLETED && loginState !== FAILED)
);

const login = createAsyncDuck({
  actionName: 'learninglocker/auth/ORG_LOGIN',

  reduceStart: state => state.set('orgLoginRequestState', IN_PROGRESS),
  reduceSuccess: state => state.set('orgLoginRequestState', COMPLETED).set('orgLoginError', null),
  reduceFailure: (state, { error }) => state.set('orgLoginRequestState', FAILED).set('orgLoginError', error),
  reduceComplete: state => state.set('orgLoginRequestState', null),

  startAction: ({ organisation }) => ({ organisation }),
  successAction: () => ({}),
  failureAction: ({ error }) => ({ error }),
  completeAction: () => ({}),
  checkShouldFire: (action, state) => shouldLoginSelector(state),

  doAction: function* loginSaga({ organisation }) {
    const token = yield select(tokenSelectors.authTokenSelector());
    if (!token) throw Error('Organisation login attempted with no user login');

    const { status, body } = yield post({
      url: `/api${routes.AUTH_JWT_ORGANISATION}`,
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: {
        organisation
      }
    });

    if (status > 200 && status < 500) throw new Error(body);
    if (status >= 500) throw new Error('There was an error communicating with the login server.');
    const orgToken = body;
    yield put(tokenActions.decodeLoginTokenAction(orgToken, false));
    yield put(routerActions.navigateTo('organisation', { organisationId: organisation }));
  }
});

export const selectors = {};
export const constants = login.constants;
export const reducers = login.reducers;
export const actions = login.actions;
export const sagas = login.sagas;
