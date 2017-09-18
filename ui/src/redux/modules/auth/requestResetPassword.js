import { createSelector } from 'reselect';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import * as routes from 'lib/constants/routes';
import { post } from 'popsicle';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';

const authSelector = state => state.auth;

const requestResetErrorSelector = createSelector(
  authSelector,
  auth => auth.get('requestResetError')
);

const requestResetRequestStateSelector = createSelector(
  authSelector,
  auth => auth.get('passwordRequestResetState', false)
);

const shouldResetSelector = createSelector(
  [requestResetRequestStateSelector],
  resetState =>
    (resetState !== IN_PROGRESS && resetState !== COMPLETED && resetState !== FAILED)
);

const requestResetPassword = createAsyncDuck({
  actionName: 'learninglocker/auth/REQUEST_RESET_PASSWORD',

  reduceStart: state => state.set('passwordRequestResetState', IN_PROGRESS),
  reduceSuccess: state => state.set('passwordRequestResetState', COMPLETED).set('requestResetError', null),
  reduceFailure: (state, { error }) => state.set('passwordRequestResetState', FAILED).set('requestResetError', error.message),
  reduceComplete: state => state.set('passwordRequestResetState', null),

  startAction: email => ({ email }),
  successAction: () => ({}),
  failureAction: error => ({ error }),
  completeAction: () => ({}),
  checkShouldFire: (action, state) => shouldResetSelector(state),

  successDelay: -1,

  doAction: function* requestResetPasswordSaga({ email }) {
    const { status, body } = yield post({
      url: `/api${routes.AUTH_RESETPASSWORD_REQUEST}`,
      body: {
        email
      }
    });

    if (status > 204 && status < 500) throw new Error(body.message || body);
    if (status >= 500) throw new Error('There was an error communicating with the login server.');
  }
});

export const selectors = { requestResetErrorSelector, requestResetRequestStateSelector };
export const reducers = requestResetPassword.reducers;
export const actions = requestResetPassword.actions;
export const sagas = requestResetPassword.sagas;
