import { createSelector } from 'reselect';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import has from 'lodash/has';
import * as routes from 'lib/constants/routes';
import { post } from 'popsicle';

import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';

const authSelector = state => state.auth;

const resetRequestStateSelector = createSelector(
  [authSelector],
  auth => auth.get('passwordResetState', false)
);

const resetErrorSelector = createSelector(
  [authSelector],
  auth => auth.get('resetError')
);


const shouldResetSelector = createSelector(
  [resetRequestStateSelector],
  requestState =>
    (requestState !== IN_PROGRESS && requestState !== COMPLETED && requestState !== FAILED)
);

const resetPassword = createAsyncDuck({
  actionName: 'learninglocker/auth/RESET_PASSWORD',

  reduceStart: state => state.set('passwordResetState', IN_PROGRESS),
  reduceSuccess: state => state.set('passwordResetState', COMPLETED).set('resetError', null),
  reduceFailure: (state, { error }) =>
    state.set('passwordResetState', FAILED).set('resetError', error.message),
  reduceComplete: state => state.set('passwordResetState', null),

  startAction: ({ email, token, password }) => ({ email, token, password }),
  successAction: () => ({}),
  failureAction: error => ({ error }),
  completeAction: () => ({}),
  checkShouldFire: (action, state) => shouldResetSelector(state),

  successDelay: -1,

  doAction: function* resetPasswordSaga({ email, token, password }) {
    if (password.length === 0) {
      throw new Error('You must enter a password');
    }
    const { status, body } = yield post({
      url: `/api${routes.AUTH_RESETPASSWORD_RESET}`,
      body: {
        email, token, password
      }
    });

    if (status >= 400 && status < 500) {
      const message = has(body, 'errors.password.message') ? body.errors.password.message : body.message || body;
      throw new Error(message);
    }
    if (status >= 500) throw new Error('There was an error communicating with the login server.');
  }
});

export const selectors = { resetErrorSelector, resetRequestStateSelector };
export const reducers = resetPassword.reducers;
export const actions = resetPassword.actions;
export const sagas = resetPassword.sagas;
