import { take, put, call, fork } from 'redux-saga/effects';
import { Map } from 'immutable';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { normalize, arrayOf } from 'normalizr';
import {
  mergeEntities,
  deleteModelSuccess,
  entityReviver,
  MERGE_PERSONA_START,
  MERGE_PERSONA_SUCCESS,
  MERGE_PERSONA_FAILURE,
  MERGE_PERSONA_DONE,
  ASSIGN_PERSONA_START,
  ASSIGN_PERSONA_SUCCESS,
  ASSIGN_PERSONA_FAILURE,
  ASSIGN_PERSONA_DONE,
  CREATE_PERSONA_FROM_IDENTIFIER_START,
  CREATE_PERSONA_FROM_IDENTIFIER_SUCCESS,
  CREATE_PERSONA_FROM_IDENTIFIER_FAILURE,
  CREATE_PERSONA_FROM_IDENTIFIER_DONE,
} from 'ui/redux/modules/models';
import * as schemas from 'ui/utils/schemas';
import { clearModelsCache } from 'ui/redux/modules/pagination';

const UPLOAD_PEOPLE = 'learninglocker/uploadpeople/UPLOAD_PEOPLE';
const UPLOAD_PEOPLE_SUCCESS = 'learninglocker/uploadpeople/UPLOAD_PEOPLE_SUCCESS';
const UPLOAD_PEOPLE_FAILURE = 'learninglocker/uploadpeople/UPLOAD_PEOPLE_FAILURE';
const UPLOAD_PEOPLE_RESET = 'learninglocker/uploadpeople/UPLOAD_PEOPLE_RESET';
const MERGE_PERSONA = 'learninglocker/mergepersona/MERGE_PERSONA';
const ASSIGN_PERSONA = 'learninglocker/assignpersona/ASSIGN_PERSONA';
const CREATE_PERSONA_FROM_IDENTIFIER = 'learninglocker/createpersonafromidentifier/CREATE_PERSONA_FROM_IDENTIFIER';

export const IN_PROGRESS = 'learninglocker/uploadpeople/IN_PROGRESS';
export const SUCCESS = 'learninglocker/uploadpeople/SUCCESS';
export const FAILED = 'learninglocker/uploadpeople/FAILED';

const initialState = {
  message: ''
};

/*
 * Reducers
 */
const personaSchema = 'persona';

const handler = handleActions({
  [UPLOAD_PEOPLE]: state => state.set('uploadState', IN_PROGRESS),
  [UPLOAD_PEOPLE_FAILURE]: (state, action) => (
    state.set('uploadState', FAILED).set('error', action.error)
  ),
  [UPLOAD_PEOPLE_SUCCESS]: (state, action) => (
    state
      .set('uploadState', SUCCESS)
      .set('message', action.body.message)
      .set('importModel', action.body.modelId)
  ),
  [UPLOAD_PEOPLE_RESET]: state => (
    state
      .set('uploadState', null)
      .set('message', '')
  )
});

export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(new Map(state), action); // ensure immutability
  return handler(state, action);
}


/*
 * Actions
 */

export const uploadPeople = (file, owner) => ({
  type: UPLOAD_PEOPLE,
  file,
  owner
});

export const uploadPeopleSuccess = body => ({
  type: UPLOAD_PEOPLE_SUCCESS,
  body
});

export const uploadPeopleFailure = err => ({
  type: UPLOAD_PEOPLE_FAILURE,
  error: err
});
export const uploadPeopleReset = () => ({
  type: UPLOAD_PEOPLE_RESET
});

export const mergePersona = (mergePersonaFromId, mergePersonaToId) => ({
  type: MERGE_PERSONA,
  mergePersonaFromId,
  mergePersonaToId
});

export const mergePersonaStart = id => ({
  type: MERGE_PERSONA_START,
  id
});

export const mergePersonaSuccess = id => ({
  type: MERGE_PERSONA_SUCCESS,
  id
});

export const mergePersonaFailure = (id, err) => ({
  type: MERGE_PERSONA_FAILURE,
  id,
  err
});

export const mergePersonaDone = id => ({
  type: MERGE_PERSONA_DONE,
  id
});

export const assignPersona = (personaId, personaIdentifierId) => ({
  type: ASSIGN_PERSONA,
  personaId,
  personaIdentifierId
});

export const assignPersonaStart = id => ({
  type: ASSIGN_PERSONA_START,
  id
});

export const assignPersonaSuccess = id => ({
  type: ASSIGN_PERSONA_SUCCESS,
  id
});

export const assignPersonaFailure = (id, err) => ({
  type: ASSIGN_PERSONA_FAILURE,
  id,
  err
});

export const assignPersonaDone = id => ({
  type: ASSIGN_PERSONA_DONE,
  id
});

export const createPersonaFromIdentifier = personaIdentifierId => ({
  type: CREATE_PERSONA_FROM_IDENTIFIER,
  personaIdentifierId
});

export const createPersonaFromIdentifierStart = id => ({
  type: CREATE_PERSONA_FROM_IDENTIFIER_START,
  id
});

export const createPersonaFromIdentifierSuccess = id => ({
  type: CREATE_PERSONA_FROM_IDENTIFIER_SUCCESS,
  id
});

export const createPersonaFromIdentifierFailure = (id, err) => ({
  type: CREATE_PERSONA_FROM_IDENTIFIER_FAILURE,
  id,
  err
});

export const createPersonaFromIdentifierDone = id => ({
  type: CREATE_PERSONA_FROM_IDENTIFIER_DONE,
  id
});

/*
 * Sagas
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function* uploadPeopleSaga() {
  while (true) {
    const { file, owner, llClient } = yield take(UPLOAD_PEOPLE);
    const { body, status } = yield call(llClient.peopleUpload, file, owner);

    if (status > 200 && status < 500) yield put(uploadPeopleFailure(body));
    else if (status >= 500) yield put(uploadPeopleFailure(body));
    else {
      yield put(uploadPeopleSuccess(body));
      yield call(delay, 2000);
      yield put(uploadPeopleReset());
    }
  }
}

function* mergePersonaSaga() {
  while (true) {
    const {
      mergePersonaFromId,
      mergePersonaToId,
      llClient,
    } = yield take(MERGE_PERSONA);

    yield put(mergePersonaStart(mergePersonaToId));
    try {
      const { status, body } = yield call(
        llClient.mergePersona, mergePersonaFromId, mergePersonaToId
      );

      if (status > 204 && status < 500) throw new Error(body.message || body);
      if (status >= 500) throw new Error('There was an error communicating with the server.');

      const schemaClass = schemas.personaIdentifier;
      const result = normalize(body, arrayOf(schemaClass));
      const entities = entityReviver(result);
      yield put(mergeEntities(entities));
      yield put(deleteModelSuccess({ schema: personaSchema, id: mergePersonaFromId }));
      yield put(mergePersonaSuccess(mergePersonaToId));
      yield call(delay, 2000); // shows success state for 2 seconds
      yield put(mergePersonaDone(mergePersonaToId));
    } catch (err) {
      yield put(mergePersonaFailure(mergePersonaToId, err));
    }
  }
}

function* assignPersonaSaga({ personaId, personaIdentifierId, llClient }) {
  try {
    yield put(assignPersonaStart(personaIdentifierId));
    const { status, body } = yield call(
      llClient.assignPersona, personaId, personaIdentifierId
    );

    if (status > 204 && status < 500) throw new Error(body.message || body);
    if (status >= 500) throw new Error('There was an error communicating with the server.');

    const schemaClass = schemas.personaIdentifier;
    const result = normalize(body, schemaClass);
    const entities = entityReviver(result);
    yield put(clearModelsCache({ schema: 'personaIdentifier' }));
    yield put(mergeEntities(entities));
    yield put(assignPersonaSuccess(personaIdentifierId));
    yield call(delay, 2000); // shows success state for 2 seconds
    yield put(assignPersonaDone(personaIdentifierId));
  } catch (err) {
    yield put(assignPersonaFailure(personaIdentifierId, err));
  }
}

function* watchAssignPersonaSaga() {
  while (__CLIENT__) {
    const action = yield take(ASSIGN_PERSONA);
    yield fork(assignPersonaSaga, { ...action });
  }
}

function* createPersonaFromIdentifierSaga({ personaIdentifierId, llClient }) {
  try {
    yield put(createPersonaFromIdentifierStart(personaIdentifierId));
    const { status, body } = yield call(
      llClient.createPersonaFromIdentifier, personaIdentifierId
    );

    if (status > 204 && status < 500) throw new Error(body.message || body);
    if (status >= 500) throw new Error('There was an error communicating with the server.');

    const schemaClass = schemas.personaIdentifier;
    const result = normalize(body, schemaClass);
    const entities = entityReviver(result);
    yield put(createPersonaFromIdentifierSuccess(personaIdentifierId));
    yield call(delay, 2000); // shows success state for 2 seconds
    yield put(clearModelsCache({ schema: 'personaIdentifier' }));
    yield put(mergeEntities(entities));
    yield put(createPersonaFromIdentifierDone(personaIdentifierId));
  } catch (err) {
    yield put(createPersonaFromIdentifierFailure(personaIdentifierId, err));
  }
}

function* watchCreatePersonaFromIdentifierSaga() {
  while (__CLIENT__) {
    const action = yield take(CREATE_PERSONA_FROM_IDENTIFIER);
    yield fork(createPersonaFromIdentifierSaga, { ...action });
  }
}

/*
 * Selectors
 */

export const uploadPeopleSelector = state => state.uploadpeople;

export const uploadStateSelector = createSelector(
  uploadPeopleSelector,
  uploadpeople => uploadpeople.get('uploadState', null)
);

export const uploadMessageSelector = createSelector(
  uploadPeopleSelector,
  uploadpeople => uploadpeople.get('message', false)
);

export const uploadErrorSelector = createSelector(
  uploadPeopleSelector,
  uploadpeople => uploadpeople.get('error', 'Something went wrong!')
);

export const importModelSelector = createSelector(
  uploadPeopleSelector,
  uploadpeople => uploadpeople.get('importModel', '')
);

export const sagas = [
  uploadPeopleSaga,
  mergePersonaSaga,
  watchAssignPersonaSaga,
  watchCreatePersonaFromIdentifierSaga
];
