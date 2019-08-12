import { fromJS, Iterable, Map } from 'immutable';
import { call, put } from 'redux-saga/effects';
import { handleActions } from 'redux-actions';
import Unauthorised from 'lib/errors/Unauthorised';
import HttpError from 'ui/utils/errors/HttpError';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import { fetchModel } from 'ui/redux/actions';

const UPDATE_USER_ORGANISATION_SETTING = 'learninglocker/userOrganisationSettings/UPDATE';

/*
 * Sagas
 */
export const duck = createAsyncDuck({
  actionName: UPDATE_USER_ORGANISATION_SETTING,

  reduceStart: (state, { userId, organisationId }) => state.setIn([`${userId}-${organisationId}`, 'requestState'], IN_PROGRESS),
  reduceSuccess: (state, { userId, organisationId }) => state.setIn([`${userId}-${organisationId}`, 'requestState'], COMPLETED),
  reduceFailure: (state, { userId, organisationId }) => state.setIn([`${userId}-${organisationId}`, 'requestState'], FAILED),
  reduceComplete: (state, { userId, organisationId }) => {
    const path = [`${userId}-${organisationId}`, 'requestState'];
    if (state.hasIn(path)) {
      return state.setIn(path, null);
    }
    return state;
  },

  startAction: ({ userId, organisationId, values }) => ({ userId, organisationId, values }),
  successAction: ({ userId, organisationId }) => ({ userId, organisationId }),
  failureAction: ({ userId, organisationId }) => ({ userId, organisationId }),
  completeAction: ({ userId, organisationId }) => ({ userId, organisationId }),
  doAction: function* doAction({ userId, organisationId, values, llClient }) {
    const immutableValues = Iterable.isIterable(values) ? values : fromJS(values);

    const { status, body } = yield call(
      llClient.updateUserOrganisationSettings,
      {
        userId,
        organisationId,
        values: immutableValues.toJS(),
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
export const reducers = (state = initialState, action = {}) => handler(state, action);
