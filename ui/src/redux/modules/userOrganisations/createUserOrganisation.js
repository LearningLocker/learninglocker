import { Map } from 'immutable';
import { call, put } from 'redux-saga/effects';
import { handleActions } from 'redux-actions';
import Unauthorised from 'lib/errors/Unauthorised';
import HttpError from 'ui/utils/errors/HttpError';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { fetchModel } from 'ui/redux/actions';

const CREATE_USER_ORGANISATION = 'learninglocker/userOrganisations/CREATE';

/*
 * Sagas
 */
export const duck = createAsyncDuck({
  actionName: CREATE_USER_ORGANISATION,

  reduceStart: (state, { userId, organisationId }) => state.setIn([userId, organisationId, 'remoteCache', 'requestState'], IN_PROGRESS),
  reduceSuccess: (state, { userId, organisationId }) => state.setIn([userId, organisationId, 'remoteCache', 'requestState'], COMPLETED),
  reduceFailure: (state, { userId, organisationId }) => state.setIn([userId, organisationId, 'remoteCache', 'requestState'], FAILED),
  reduceComplete: (state, { userId, organisationId }) => {
    const path = [userId, organisationId, 'remoteCache', 'requestState'];
    if (state.hasIn(path)) {
      return state.setIn(path, null);
    }
    return state;
  },

  startAction: ({ userId, organisationId }) => ({ userId, organisationId }),
  successAction: ({ userId, organisationId }) => ({ userId, organisationId }),
  failureAction: ({ userId, organisationId }) => ({ userId, organisationId }),
  completeAction: ({ userId, organisationId }) => ({ userId, organisationId }),
  doAction: function* doAction({ userId, organisationId, llClient }) {
    const { status, body } = yield call(
      llClient.addOrganisationToUser,
      {
        userId,
        organisationId,
      },
    );

    if (status === 401) {
      throw new Unauthorised('Unauthorised');
    }

    if (status >= 300) {
      const errorMessage = body.message || body;
      throw new HttpError(errorMessage, { status });
    }

    yield put(fetchModel({ schema: 'user', id: userId, force: true }));

    return yield {
      body,
      userId,
      organisationId,
    };
  }
});

/**
 * Reducer
 */
const handler = handleActions(duck.reducers);
const initialState = new Map();
export const reducer = (state = initialState, action = {}) => handler(state, action);
