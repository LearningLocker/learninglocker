import { fromJS } from 'immutable';
import { put, take, select } from 'redux-saga/effects';
import * as schemas from 'ui/utils/schemas';
import { modelsSchemaIdSelector } from 'ui/redux/modules/models/selectors';
import isArray from 'lodash/isArray';

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

const reduceUpdateModelErrors = (state, { schema, id, errors }) =>
  state.setIn([schema, id, 'localCache', 'unsaved', 'errors'], errors);

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
const updateModel = ({ schema, id, path, value, silent = false }) =>
  ({
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
 * SAGAS
 */
/**
 * After model has been updated, retrieve the schema,
 * validate to retrieve errors and trigger action to set errors on model
 * @param {[type]} getState      [description]
 */
function* watchUpdateModelSaga() {
  while (__CLIENT__) {
    const { schema, id } = yield take(UPDATE_MODEL);
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
