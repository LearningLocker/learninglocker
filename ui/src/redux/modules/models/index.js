import { Map, fromJS } from 'immutable';
import { take, put, fork, call, select } from 'redux-saga/effects';
import { handleActions } from 'redux-actions';
import * as addModelDuck from 'ui/redux/modules/models/addModel';
import * as updateModelDuck from 'ui/redux/modules/models/updateModel';
import * as deleteModelDuck from 'ui/redux/modules/models/deleteModel';
import * as saveModelDuck from 'ui/redux/modules/models/saveModel';
import * as fetchModelDuck from 'ui/redux/modules/models/fetchModel';
import * as mergeEntitiesDuck from 'ui/redux/modules/models/mergeEntities';
import * as autoSaveModelDuck from 'ui/redux/modules/models/autoSaveModel';
import * as pollWhileDuck from 'ui/redux/modules/models/pollWhile';
import {
  modelsSchemaSelector,
  modelsSchemaIdSelector,
  modelsByFilterSelector,
} from 'ui/redux/modules/models/selectors';
import { fetchModels } from 'ui/redux/modules/pagination';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';

export const MERGE_ENTITIES = mergeEntitiesDuck.constants.MERGE_ENTITIES;
export const DELETE_MODEL_SUCCESS = deleteModelDuck.constants.SUCCESS;
export const MODELS_WORKER = 'learninglocker/models/learninglocker/models/MODELS_WORKER';
export const EXPAND_MODEL = 'learninglocker/models/EXPAND_MODEL';
export const MERGE_PERSONA_START = 'learninglocker/mergepersona/MERGE_PERSONA_START';
export const MERGE_PERSONA_SUCCESS = 'learninglocker/mergepersona/MERGE_PERSONA_SUCCESS';
export const MERGE_PERSONA_FAILURE = 'learninglocker/mergepersona/MERGE_PERSONA_FAILURE';
export const MERGE_PERSONA_DONE = 'learninglocker/mergepersona/MERGE_PERSONA_DONE';
export const ASSIGN_PERSONA_START = 'learninglocker/assignpersona/ASSIGN_PERSONA_START';
export const ASSIGN_PERSONA_SUCCESS = 'learninglocker/assignpersona/ASSIGN_PERSONA_SUCCESS';
export const ASSIGN_PERSONA_FAILURE = 'learninglocker/assignpersona/ASSIGN_PERSONA_FAILURE';
export const ASSIGN_PERSONA_DONE = 'learninglocker/assignpersona/ASSIGN_PERSONA_DONE';
export const CREATE_PERSONA_FROM_IDENTIFIER_START = 'learninglocker/createpersonafromidentifier/CREATE_PERSONA_FROM_IDENTIFIER_START';
export const CREATE_PERSONA_FROM_IDENTIFIER_SUCCESS = 'learninglocker/createpersonafromidentifier/CREATE_PERSONA_FROM_IDENTIFIER_SUCCESS';
export const CREATE_PERSONA_FROM_IDENTIFIER_FAILURE = 'learninglocker/createpersonafromidentifier/CREATE_PERSONA_FROM_IDENTIFIER_FAILURE';
export const CREATE_PERSONA_FROM_IDENTIFIER_DONE = 'learninglocker/createpersonafromidentifier/CREATE_PERSONA_FROM_IDENTIFIER_DONE';

export const ADD_MODEL_START = addModelDuck.constants.START;
export const ADD_MODEL_SUCCESS = addModelDuck.constants.SUCCESS;
export const ADD_MODEL_FAILURE = addModelDuck.constants.FAILURE;

/*
 * Reducers
 */
const handler = handleActions({
  ...addModelDuck.reducers,
  ...deleteModelDuck.reducers,
  ...saveModelDuck.reducers,
  ...autoSaveModelDuck.reducers,
  ...fetchModelDuck.reducers,
  ...updateModelDuck.reducers,
  ...pollWhileDuck.reducers,
  ...mergeEntitiesDuck.reducers,
  [EXPAND_MODEL]: (state, action) => {
    const { schema, id, isExpanded } = action;
    return state.setIn([schema, id, 'isExpanded'], isExpanded);
  },

  [MERGE_PERSONA_START]: (state, action) => {
    const { id } = action;
    return state.setIn(['persona', id, 'mergeState'], IN_PROGRESS);
  },
  [MERGE_PERSONA_SUCCESS]: (state, action) => {
    const { id } = action;
    return state.setIn(['persona', id, 'mergeState'], COMPLETED);
  },
  [MERGE_PERSONA_FAILURE]: (state, action) => {
    const { id } = action;
    return state.setIn(['persona', id, 'mergeState'], FAILED);
  },
  [MERGE_PERSONA_DONE]: (state, action) => {
    const { id } = action;
    return state.setIn(['persona', id, 'mergeState'], null);
  },

  [ASSIGN_PERSONA_START]: (state, action) => {
    const { id } = action;
    return state.setIn(['personaIdentifier', id, 'assignState'], IN_PROGRESS);
  },
  [ASSIGN_PERSONA_SUCCESS]: (state, action) => {
    const { id } = action;
    return state.setIn(['personaIdentifier', id, 'assignState'], COMPLETED);
  },
  [ASSIGN_PERSONA_FAILURE]: (state, action) => {
    const { id } = action;
    return state.setIn(['personaIdentifier', id, 'assignState'], FAILED);
  },
  [ASSIGN_PERSONA_DONE]: (state, action) => {
    const { id } = action;
    return state.setIn(['personaIdentifier', id, 'assignState'], null);
  },

  [CREATE_PERSONA_FROM_IDENTIFIER_START]: (state, action) => {
    const { id } = action;
    return state.setIn(['personaIdentifier', id, 'createPersonaState'], IN_PROGRESS);
  },
  [CREATE_PERSONA_FROM_IDENTIFIER_SUCCESS]: (state, action) => {
    const { id } = action;
    return state.setIn(['personaIdentifier', id, 'createPersonaState'], COMPLETED);
  },
  [CREATE_PERSONA_FROM_IDENTIFIER_FAILURE]: (state, action) => {
    const { id } = action;
    return state.setIn(['personaIdentifier', id, 'createPersonaState'], FAILED);
  },
  [CREATE_PERSONA_FROM_IDENTIFIER_DONE]: (state, action) => {
    const { id } = action;
    return state.setIn(['personaIdentifier', id, 'createPersonaState'], null);
  },
});

const initialState = new Map();
export default function reducer(state = initialState, action = {}) {
  if (!Map.isMap(state)) return reducer(fromJS(state), action); // ensure immutability
  return handler(state, action);
}

/*
 * Actions
 */

/**
 * @param  {Immutable.Map} models normalized object model {type: {id: model}}
 * @return {[type]}        [description]
 */
export const mergeEntities = mergeEntitiesDuck.actions.mergeEntitiesAction;
export entityReviver from 'ui/redux/modules/models/entityReviver';
export const addModel = addModelDuck.actions.start;
export const deleteModel = deleteModelDuck.actions.start;
export const deleteModelSuccess = deleteModelDuck.actions.success;
export const saveModel = saveModelDuck.actions.start;
export const fetchModel = fetchModelDuck.actions.start;
export const updateModel = updateModelDuck.actions.updateModel;
export const updateModelErrors = updateModelDuck.actions.updateModelErrors;
export const pollWhile = pollWhileDuck.actions.pollWhile;

export const expandModel = (schema, id, isExpanded) => ({
  type: EXPAND_MODEL,
  schema,
  id,
  isExpanded
});

/**
 * recursive model fetching for models going back in a worker
 * needs to be triggered once when models go back in to work
 *
 * @param  {String}         schema        schema e.g. 'visualisation'
 * @param  {Immutable.Map}  model         id e.g. {"_id":"57a3086f792ca3d74f519c92" ... }
 * @param  {Object}         progressModel settings found in utils/constants -PROGRESS_MODELS
 * @param  {Bool}           force         you know the model is being worked
 *                                        but fetch has not happened
 *                                        force the modelsWorker on first attempt
 */
export const modelsWorker = (schema, model, progressModel, force = false) => ({
  type: MODELS_WORKER,
  schema,
  model,
  progressModel,
  force
});

/*
 * Selectors
 */
export const shouldFetchModelSelector = fetchModelDuck.selectors.shouldFetchModelSelector;
export const isLoadingModelSelector = fetchModelDuck.selectors.isLoadingModelSelector;
export {
  modelsSchemaSelector,
  modelsSchemaIdSelector,
  modelsByFilterSelector
};

/*
 * Sagas
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * recursive model fetching for models going back in a worker,
 * will continue until the inProgress bool is false,
 * settings found in utils/constants -PROGRESS_MODELS
 */
function* workerModelSaga({ schema, model, progressModel, force }) {
  const check = model.get(progressModel.statusObject, new Map({}));
  if (check.get(progressModel.inProgress, false) || force) {
    yield put(fetchModels({ schema, filter: new Map({}) }));
    yield call(delay, 3000);
    const newModel = yield select(state => modelsSchemaIdSelector(schema, model.get('_id'))(state));
    yield put(modelsWorker(schema, newModel, progressModel));
  }
}

function* watchWorkerModelSaga() {
  while (__CLIENT__) {
    const action = yield take(MODELS_WORKER);
    yield fork(workerModelSaga, action);
  }
}

export const sagas = [
  ...addModelDuck.sagas,
  ...deleteModelDuck.sagas,
  ...saveModelDuck.sagas,
  ...fetchModelDuck.sagas,
  ...updateModelDuck.sagas,
  ...autoSaveModelDuck.sagas,
  ...pollWhileDuck.sagas,
  ...mergeEntitiesDuck.sagas,
  watchWorkerModelSaga
];
