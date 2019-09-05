import { fromJS } from 'immutable';
import { put, take, select } from 'redux-saga/effects';
import isArray from 'lodash/isArray';
import * as schemas from 'ui/utils/schemas';
import { modelsSchemaIdSelector } from 'ui/redux/modules/models/selectors';
import { clearModelsCache } from 'ui/redux/modules/pagination';

export const UPDATE_MODEL =
  'learninglocker/models/learninglocker/models/UPDATE_MODEL';
export const UPDATE_MODEL_ERRORS =
  'learninglocker/models/learninglocker/models/UPDATE_MODEL_ERRORS';
export const MAKE_PENDING =
  'learninglocker/models/learninglocker/models/MAKE_PENDING';
export const CLEAR_PENDING =
  'learninglocker/models/learninglocker/models/CLEAR_PENDING';

/**
 * REDUCERS
 */
const reduceUpdateModel = (state, { schema, id, path, value }) => {
  const out = state.setIn([schema, id, 'localCache', 'unsaved', ...path], value);
  return out;
};

const reduceUpdateModelErrors = (state, { schema, id, errors }) => {
  const out = state.setIn([schema, id, 'localCache', 'unsaved', 'errors'], errors);
  return out;
};

const reduceMakePending = (state, { schema, id }) => {
  const unsavedState = state.getIn([schema, id, 'localCache', 'unsaved']);
  return state
    .mergeIn([schema, id, 'localCache', 'pending'], unsavedState)
    .deleteIn([schema, id, 'localCache', 'unsaved']);
};

const reduceClearPending = (state, { schema, id }) =>
  state.deleteIn([schema, id, 'localCache', 'pending']);

/**
 * ACTIONS
 */
const updateModel = ({ schema, id, path, value, silent = false }) => ({
  type: UPDATE_MODEL,
  schema,
  id,
  path: (isArray(path) ? path : [path]),
  value,
  silent
});

const updateModelErrors = (schema, id, errors) => ({
  type: UPDATE_MODEL_ERRORS,
  schema,
  id,
  errors
});

const makePending = (schema, id) => ({
  type: MAKE_PENDING,
  schema,
  id
});

const clearPending = (schema, id) => ({
  type: CLEAR_PENDING,
  schema,
  id
});

/**
 * Client should clear the models stored in Redux
 * because when organisation.timezone is updated,
 * dashboard, user, statementForward, and visualisation models are updated by API server.
 */
const requiresClearingModels = (schema, path) =>
  schema === 'organisation' && isArray(path) && path[0] === 'timezone';

/**
 * SAGAS
 */
/**
 * After model has been updated, retrieve the schema,
 * validate to retrieve errors and trigger action to set errors on model
 * @param {[type]} getState      [description]
 */
function* watchUpdateModelSaga() {
  while (__CLIENT__) {
    const { schema, id, path } = yield take(UPDATE_MODEL);
    if (requiresClearingModels(schema, path)) {
      yield put(clearModelsCache({ schema: 'dashboard' }));
      yield put(clearModelsCache({ schema: 'user' }));
      yield put(clearModelsCache({ schema: 'statementForward' }));
      yield put(clearModelsCache({ schema: 'visualisation' }));
    }
    const model = yield select(state =>
      modelsSchemaIdSelector(schema, id)(state)
    );
    const errors = schemas[schema].validate(model);
    yield put(updateModelErrors(schema, id, fromJS(errors)));
  }
}

export const selectors = {};
export const reducers = {
  [UPDATE_MODEL]: reduceUpdateModel,
  [UPDATE_MODEL_ERRORS]: reduceUpdateModelErrors,
  [MAKE_PENDING]: reduceMakePending,
  [CLEAR_PENDING]: reduceClearPending
};
export const actions = {
  updateModel,
  updateModelErrors,
  makePending,
  clearPending
};
export const sagas = [watchUpdateModelSaga];
