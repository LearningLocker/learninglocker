import { call, put, select } from 'redux-saga/effects';
import { List } from 'immutable';
import { createSelector } from 'reselect';
import { post } from 'popsicle';
import { delay } from 'bluebird';
import moment from 'moment';
import * as routes from 'lib/constants/routes';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { actions as tokenActions } from './token';

const REFRESH_ACTION = 'learninglocker/auth/REFRESH';

const authSelector = state => state.auth;

const refreshRequestStateSelector = createSelector(
  [authSelector],
  auth => auth.get('refreshRequestState', false),
);

const shouldRefreshSelector = createSelector(
  [refreshRequestStateSelector],
  refreshState =>
    (refreshState !== IN_PROGRESS && refreshState !== COMPLETED && refreshState !== FAILED)
);

const userTokenSelector = createSelector(
  [authSelector],
  auth => auth.getIn(['tokens', 'user'], new List()),
);

const refreshToken = createAsyncDuck({
  actionName: REFRESH_ACTION,

  reduceStart: state => state.set('refreshRequestState', IN_PROGRESS),
  reduceSuccess: state => state.set('refreshRequestState', COMPLETED).set('refreshError', null),
  reduceFailure: (state, { error }) => state.set('refreshRequestState', FAILED).set('refreshError', error.message),
  reduceComplete: state => state.set('refreshRequestState', null),

  startAction: ({ tokenType, tokenId }) => ({ tokenType, tokenId }),
  successAction: () => ({}),
  failureAction: error => ({ error }),
  completeAction: () => ({}),

  checkShouldFire: (_, state) => shouldRefreshSelector(state),

  doAction: function* refreshSaga({ tokenType, tokenId }) {
    const { status, body } = yield post({
      url: `/api${routes.AUTH_JWT_REFRESH}`,
      body: {
        id: tokenId,
        tokenType,
      }
    });

    if (status > 200 && status < 500) {
      throw new Error(body.message || body);
    } else if (status >= 500) {
      throw new Error('There was an error communicating with the refresh token server.');
    } else {
      yield put(tokenActions.decodeLoginTokenAction(body));
    }
  }
});

function* checkTokensExpired() {
  const userToken = yield select(userTokenSelector);

  const expMoment = moment.unix(userToken.get('exp'));
  const fiveMinutesLater = moment().add(3, 'minutes');
  const willExpiredSoon = expMoment.isBefore(fiveMinutesLater);
  if (willExpiredSoon) {
    const tokenType = userToken.get('tokenType');
    const tokenId = userToken.get('tokenId');
    yield put(refreshToken.actions.start({ tokenType, tokenId }));
  }
}

function* pollRefreshTokenSaga() {
  while (true) {
    yield call(delay, 30000);
    yield checkTokensExpired();
  }
}

export const selectors = {};
export const constants = refreshToken.constants;
export const reducers = refreshToken.reducers;
export const actions = refreshToken.actions;
export const sagas = [pollRefreshTokenSaga, ...refreshToken.sagas];
