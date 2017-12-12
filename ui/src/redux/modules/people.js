import { take, put, call } from 'redux-saga/effects';
import { Map } from 'immutable';
import { handleActions } from 'redux-actions';
import {
  MERGE_PERSONA_START,
  MERGE_PERSONA_SUCCESS,
  MERGE_PERSONA_FAILURE,
  MERGE_PERSONA_DONE,
} from 'ui/redux/modules/models';
import * as clearModelsCacheDuck from 'ui/redux/modules/pagination/clearModelsCache';

const MERGE_PERSONA = 'learninglocker/mergepersona/MERGE_PERSONA';

const IN_PROGRESS = 'IN_PROGRESS';
const COMPLETED = 'COMPLETED';
const FAILED = 'FAILED';

const initialState = {
  message: ''
};

const handler = handleActions({
  [MERGE_PERSONA_START]: (state, { id }) => (
      state.setIn([id, 'requestState'], IN_PROGRESS)
    ),
  [MERGE_PERSONA_SUCCESS]: (state, { id }) => (
    state.setIn([id, 'requestState'], COMPLETED)
  ),
  [MERGE_PERSONA_FAILURE]: (state, { id }) => (
    state.setIn([id, 'requestState'], FAILED)
  ),
  [MERGE_PERSONA_DONE]: (state, { id }) => (
    state.setIn([id, 'requestState'], null)
  )
});

export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(new Map(state), action); // ensure immutability
  return handler(state, action);
}


/*
 * Actions
 */

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

/*
 * Sagas
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

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


      yield put(clearModelsCacheDuck.actions.clearModelsCache({ schema: 'persona' }));
      yield put(clearModelsCacheDuck.actions.clearModelsCache({ schema: 'personaIdentifier' }));
      yield put(clearModelsCacheDuck.actions.clearModelsCache({ schema: 'personaAttribute' }));
      yield put(mergePersonaSuccess(mergePersonaToId));
      yield call(delay, 2000); // shows success state for 2 seconds
      yield put(mergePersonaDone(mergePersonaToId));
    } catch (err) {
      yield put(mergePersonaFailure(mergePersonaToId, err));
    }
  }
}

/*
 * Selectors
 */

export const mergePersonaSelector = state => state.mergePersona;

export const sagas = [
  mergePersonaSaga,
];
