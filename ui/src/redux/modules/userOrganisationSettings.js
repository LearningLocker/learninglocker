import { fromJS, Iterable } from 'immutable';
import { call } from 'redux-saga/effects';
import Unauthorised from 'lib/errors/Unauthorised';
import HttpError from 'ui/utils/errors/HttpError';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import createAsyncDuck from 'ui/utils/createAsyncDuck';

const UPDATE_USER_ORGANISATION_SETTING = 'learninglocker/userOrganisationSettings/UPDATE';

/*
 * Sagas
 */
const duck = createAsyncDuck({
  actionName: UPDATE_USER_ORGANISATION_SETTING,

  reduceStart: (state, { userId, organisationId }) => state.setIn(['userOrganisationSettings', userId, organisationId, 'remoteCache', 'requestState'], IN_PROGRESS),
  reduceSuccess: (state, { userId, organisationId }) => state.setIn(['userOrganisationSettings', userId, organisationId, 'remoteCache', 'requestState'], COMPLETED),
  reduceFailure: (state, { userId, organisationId }) => state.setIn(['userOrganisationSettings', userId, organisationId, 'remoteCache', 'requestState'], FAILED),
  reduceComplete: (state, { userId, organisationId }) => {
    const path = ['userOrganisationSettings', userId, organisationId, 'remoteCache', 'requestState'];
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

    // todo put fetch user

    return yield body;
  }
});

export const constants = duck.constants;
export const reducers = duck.reducers;
export const actions = duck.actions;
export const sagas = duck.sagas;

export const updateUserOrganisationSetting = duck.actions.start;
