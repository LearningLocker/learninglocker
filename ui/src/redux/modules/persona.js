import { take, put, call } from 'redux-saga/effects';
import { Map } from 'immutable';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { actions as mergeEntitiesActions } from 'ui/redux/modules/models/mergeEntities';
import { normalize } from 'normalizr';
import entityReviver from 'ui/redux/modules/models/entityReviver';
import * as schemas from 'ui/utils/schemas';
import { alert } from 'ui/redux/modules/alerts';
import createSyncDuck from 'ui/utils/createAsyncDuck';


const UPLOAD_PERSONAS = 'learninglocker/uploadpersona/UPLOAD_PERSONAS';
const UPLOAD_PERSONAS_RESET = 'learninglocker/uploadpersona/UPLOAD_PERSONAS_RESET';
const UPLOAD_PERSONAS_SUCCESS = 'learninglocker/uploadpersona/UPLOAD_PERSONAS_SUCCESS';
const UPLOAD_PERSONAS_FAILURE = 'learninglocker/uploadpersona/UPLOAD_PERSONAS_FAILURE';

const IMPORT_PERSONAS = 'learninglocker/uploadpersona/IMPORT_PERSONAS';

const IN_PROGRESS = 'IN_PROGRESS';
const COMPLETED = 'COMPLETED';
const FAILED = 'FAILED';

/*
 * Selectors
 */

const rootSelector = state => state.uploadPersonas;

export const requestStateSelector = ({ id }) => createSelector(
  rootSelector,
  state =>
    state.getIn([id, 'requestState'])
);

/*
 * Actions
 */
export const uploadPersonas = ({ id, file }) => ({
  type: UPLOAD_PERSONAS,
  id,
  file,
});

export const uploadPersonasSuccess = ({ id, body }) => {
  // We want to update the model

  return ({
    type: UPLOAD_PERSONAS_SUCCESS,
    body,
    id
  });
};

export const uploadPersonasFailure = ({ id, err }) => ({
  type: UPLOAD_PERSONAS_FAILURE,
  error: err,
  id
});

export const uploadPersonasReset = ({ id }) => ({
  type: UPLOAD_PERSONAS_RESET,
  id
});

/*
 * Sagas
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function* uploadPersonasSaga() {
  while (true) {
    const { id, file, llClient } = yield take(UPLOAD_PERSONAS);
    const { body, status } = yield call(llClient.personasUpload, {
      id,
      file
    });

    if (status > 200) {
      yield put(uploadPersonasFailure({ id, body }));
      yield put(alert({
        message: body
      }));
    } else {
      yield put(uploadPersonasSuccess({ id, body }));

      const schemaClass = schemas.personasImport;

      const normalizedModels = normalize(body, schemaClass);
      const entities = entityReviver(normalizedModels);

      yield put(mergeEntitiesActions.mergeEntitiesAction(
        entities
      ));

      yield call(delay, 2000);
      yield put(uploadPersonasReset({ id }));
    }
  }
}

const importPersonasDuck = createSyncDuck({
  actionName: IMPORT_PERSONAS,
  doAction:
    function* doAction({
      id,
      llClient
    }) {
      const { status, body } = yield call(llClient.importPersonas, { id });
      if (status >= 300) throw new Error(body.message || body);

      const schemaClass = schemas.personasImport;

      const normalizedModels = normalize(body, schemaClass);
      const entities = entityReviver(normalizedModels);

      yield put(mergeEntitiesActions.mergeEntitiesAction(
        entities
      ));
    }
});

/*
 * Actions
 */
export const importPersonas = importPersonasDuck.actions.start;

/*
 * Reducers
 */


const handler = handleActions({
  [UPLOAD_PERSONAS]: (state, { id }) =>
    state.setIn([id, 'requestState'], IN_PROGRESS),
  [UPLOAD_PERSONAS_SUCCESS]: (state, { id }) =>
    state.setIn([id, 'requestState'], COMPLETED),
  [UPLOAD_PERSONAS_FAILURE]: (state, { id }) => (
    state.setIn([id, 'requestState'], FAILED)
  ),
  [UPLOAD_PERSONAS_RESET]: (state, { id }) => (
    state.deleteIn([id, 'requestState'])
  ),
});

const initialState = {};
export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(new Map(state), action); // ensure immutability
  return handler(state, action);
}

export const sagas = [
  uploadPersonasSaga,
  ...importPersonasDuck.sagas
];
