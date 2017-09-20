import { createSelector } from 'reselect';
import { put, call, select, take, cancel, fork } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { Map, List } from 'immutable';
import { UPDATE_MODEL } from 'ui/redux/modules/models/updateModel';
import { constants as deleteModelConstants } from 'ui/redux/modules/models/deleteModel';
import { saveModel } from 'ui/redux/modules/models';
import moment from 'moment';

export const ADD_TO_SAVE_QUEUE = 'learninglocker/models/ADD_TO_SAVE_QUEUE';
export const REMOVE_FROM_SAVE_QUEUE = 'learninglocker/models/REMOVE_FROM_SAVE_QUEUE';
export const PURGE_SAVE_QUEUE = 'learninglocker/models/PURGE_SAVE_QUEUE';

/**
 * REDUCERS
 */
const reduceAddToSaveQueue = (state, { schema, id }) =>
  state.setIn(['saveQueue', schema, id], moment());

const reduceRemoveFromSaveQueue = (state, { schema, id }) =>
  state.deleteIn(['saveQueue', schema, id]);

// find every entry in the queue which was last updated before we persisted and remove it
const reducePurgeSaveQueue = (state, { time }) =>
  state.update('saveQueue', schemas =>
    schemas.map(ids =>
      ids.filter(queuedTime => queuedTime > time)));


/**
 * SELECTORS
 */
const modelsSelector = state => state.models;
const saveQueueSelector = createSelector(
  [modelsSelector],
  models => models.get('saveQueue', new Map())
);

const pendingSavesSelector = createSelector([saveQueueSelector], (saveQueue) => {
  const flatQueue = saveQueue.reduce((reduction, ids, schema) => {
    const schemaIds = ids.keySeq().toList().map(id => new Map({ schema, id }));
    return reduction.concat(schemaIds);
  }, new List());
  return flatQueue;
});

/**
 * ACTIONS
 */
const addToSaveQueue = ({ schema, id }) => ({
  type: ADD_TO_SAVE_QUEUE,
  schema,
  id
});

export const removeFromSaveQueue = ({ schema, id }) => ({
  type: REMOVE_FROM_SAVE_QUEUE,
  schema,
  id
});

const purgeSaveQueue = () => ({
  type: PURGE_SAVE_QUEUE
});


/**
 * SAGAS
 */


function* persistSaveQueue() {
  const pendingSaves = yield select(state => pendingSavesSelector(state));
  const pendingSaveArray = pendingSaves.map(schemaId => put(saveModel({
    schema: schemaId.get('schema'),
    id: schemaId.get('id')
  }))).toArray();
  yield pendingSaveArray;
  yield put(purgeSaveQueue());
}

function* debounceSave() {
  yield call(delay, 1000);
  yield call(persistSaveQueue);
}

function* backgroundSaveSaga() {
  let debouncedSave; // track pending saves
  while (__CLIENT__) {
    const updateAction = yield take(UPDATE_MODEL);
    yield put(addToSaveQueue(updateAction)); // every update action is added to the save queue

    if (debouncedSave) {
      yield cancel(debouncedSave);
    } // pending saves are cancelled
    debouncedSave = yield fork(debounceSave); // and a new one is started, fires after 2 seconds
  }
}

function* removeFromSaveQueueSaga() {
  while (__CLIENT__) {
    const { schema, id } = yield take(deleteModelConstants.complete);
    yield put(removeFromSaveQueue({ schema, id }));
  }
}

export const selectors = { pendingSavesSelector };
export const reducers = {
  [ADD_TO_SAVE_QUEUE]: reduceAddToSaveQueue,
  [REMOVE_FROM_SAVE_QUEUE]: reduceRemoveFromSaveQueue,
  [PURGE_SAVE_QUEUE]: reducePurgeSaveQueue
};
export const actions = {
  addToSaveQueue
};
export const sagas = [backgroundSaveSaga, removeFromSaveQueueSaga];
