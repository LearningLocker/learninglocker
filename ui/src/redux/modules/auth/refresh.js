import { call, put, select } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import { post } from 'popsicle';
import { delay } from 'bluebird';
import moment from 'moment';
import * as routes from 'lib/constants/routes';
import Unauthorized from 'lib/errors/Unauthorised';
import { activeOrgIdSelector } from 'ui/redux/modules/router';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { actions as tokenActions } from './token';

const REFRESH_ACTION = 'learninglocker/auth/REFRESH';

const authSelector = state => state.auth;

const refreshRequestStateSelector = tokenType => createSelector(
  [authSelector],
  auth => auth.get(`${tokenType}RefreshRequestState`, false),
);

const shouldRefreshSelector = tokenType => createSelector(
  [refreshRequestStateSelector(tokenType)],
  refreshState =>
    (refreshState !== IN_PROGRESS && refreshState !== COMPLETED && refreshState !== FAILED)
);

const userTokenSelector = createSelector(
  [authSelector],
  auth => auth.getIn(['tokens', 'user'], null),
);

const activeOrgTokenSelector = createSelector(
  [authSelector, activeOrgIdSelector],
  (auth, activeOrgId) => auth.getIn(['tokens', 'organisation', activeOrgId], null),
);

const refreshToken = type => createAsyncDuck({
  actionName: `${REFRESH_ACTION}/${type}`,

  reduceStart: state => state.set(`${type}RefreshRequestState`, IN_PROGRESS),
  reduceSuccess: state => state.set(`${type}RefreshRequestState`, COMPLETED).set('refreshError', null),
  reduceFailure: (state, { error }) => state.set(`${type}RefreshRequestState`, FAILED).set('refreshError', error.message),
  reduceComplete: state => state.set(`${type}RefreshRequestState`, null),

  startAction: ({ tokenType, tokenId }) => ({ tokenType, tokenId }),
  successAction: () => ({}),
  failureAction: error => ({ error }),
  completeAction: () => ({}),

  checkShouldFire: (_, state) => shouldRefreshSelector(type)(state),

  doAction: function* refreshSaga({ tokenType, tokenId }) {
    const { status, body } = yield post({
      url: `/api${routes.AUTH_JWT_REFRESH}`,
      body: {
        id: tokenId,
        tokenType,
      }
    });

    if (status === 401) {
      throw new Unauthorized();
    } else if (status > 200 && status < 500) {
      throw new Error(body.message || body);
    } else if (status >= 500) {
      throw new Error('There was an error communicating with the refresh token server.');
    } else {
      yield put(tokenActions.decodeLoginTokenAction(body));
    }
  }
});

export const refreshUserTokenDuck = refreshToken('user');
export const refreshOrgTokenDuck = refreshToken('organisation');

function* checkTokensExpired(token, duck) {
  if (token === null) {
    return;
  }

  const expMoment = moment.unix(token.get('exp'));
  const fiveMinutesLater = moment().add(3, 'minutes');
  const willExpiredSoon = expMoment.isBefore(fiveMinutesLater);
  if (willExpiredSoon) {
    const tokenType = token.get('tokenType');
    const tokenId = token.get('tokenId');
    yield put(duck.actions.start({ tokenType, tokenId }));
  }
}

function* pollRefreshTokenSaga() {
  while (true) {
    yield call(delay, 10000);

    const userToken = yield select(userTokenSelector);
    yield checkTokensExpired(userToken, refreshUserTokenDuck);

    const orgToken = yield select(activeOrgTokenSelector);
    yield checkTokensExpired(orgToken, refreshOrgTokenDuck);
  }
}

export const selectors = {};
export const sagas = [pollRefreshTokenSaga, ...refreshUserTokenDuck.sagas, ...refreshOrgTokenDuck.sagas];
