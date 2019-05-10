import { call, put, takeEvery } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import { post } from 'popsicle';
import { delay } from 'bluebird';
import * as routes from 'lib/constants/routes';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { actions as tokenActions } from './token';

const REFRESH_ACTION = 'learninglocker/auth/REFRESH';
const RESERVE_REFRESH_ACTION = 'learninglocker/auth/RESERVE_REFRESH';

export const reserveRefreshAction = ({ tokenType, tokenId }) => ({
  type: RESERVE_REFRESH_ACTION,
  tokenType,
  tokenId,
});

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

const refreshAccessToken = createAsyncDuck({
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
      yield put(reserveRefreshAction({ tokenType, tokenId }));
    }
  }
});


function* reserveRefresh({ tokenType, tokenId }) {
  yield call(delay, 5000);
  yield put(refreshAccessToken.actions.start({ tokenType, tokenId }));
}

function* watchReserveRefreshSaga() {
  yield takeEvery(RESERVE_REFRESH_ACTION, reserveRefresh);
}

export const selectors = {};
export const constants = refreshAccessToken.constants;
export const reducers = refreshAccessToken.reducers;
export const actions = refreshAccessToken.actions;
export const sagas = [watchReserveRefreshSaga, ...refreshAccessToken.sagas];
