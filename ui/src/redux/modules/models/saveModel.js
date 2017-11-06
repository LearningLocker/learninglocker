import { fromJS, Iterable, Map } from 'immutable';
import { createSelector } from 'reselect';
import { put, call, select } from 'redux-saga/effects';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import * as schemas from 'ui/utils/schemas';
import { normalize } from 'normalizr';
import { has, each } from 'lodash';
import entityReviver from 'ui/redux/modules/models/entityReviver';
import { mergeEntities, updateModelErrors } from 'ui/redux/modules/models';
import { actions as updateModelActions } from 'ui/redux/modules/models/updateModel';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { modelsSchemaIdSelector } from 'ui/redux/modules/models/selectors';
import HttpError from 'ui/utils/errors/HttpError';

export const ADD_TO_SAVE_QUEUE = 'learninglocker/models/ADD_TO_SAVE_QUEUE';

const saveStateSelector = ({ schema, id }) => createSelector(
  modelsSchemaIdSelector(schema, id),
  (model = new Map()) => model.get('requestState', false)
);

const shouldSaveSelector = ({ schema, id }) => createSelector(
  [saveStateSelector({ schema, id })],
  (saveState) => {
    if (!id) return false;
    if (saveState === IN_PROGRESS) return false;
    return true;
  }
);

/**
 * returns a model with all of its local relations hydrated ready for saving
 * each entity and child is also passed through its schema's preSave function
 * @param  {String}        options.schema  schema to search in e.g. 'statement'
 * @param  {String}        options.id      Id to match
 * @return {Immutable.Map}                 Single hydrated object
 */
export const saveModelSelector = ({ schema, id }) => createSelector(
  modelsSchemaIdSelector(schema, id),
  (model) => {
    const schemaObject = schemas[schema];
    return schemaObject.preSave(model);
  }
);

const saveModel = createAsyncDuck({
  actionName: 'learninglocker/models/SAVE_MODEL',

  reduceStart: (state, { schema, id }) => state.setIn([schema, id, 'remoteCache', 'requestState'], IN_PROGRESS),
  reduceSuccess: (state, { schema, id }) => state.setIn([schema, id, 'remoteCache', 'requestState'], COMPLETED),
  reduceFailure: (state, { schema, id }) => state.setIn([schema, id, 'remoteCache', 'requestState'], FAILED),
  reduceComplete: (state, { schema, id }) => {
    const path = [schema, id, 'remoteCache', 'requestState'];
    if (state.hasIn(path)) {
      return state.setIn(path, null);
    }
    return state;
  },

  startAction: ({ schema, id, props }) => ({ schema, id, props }),
  successAction: ({ schema, id }) => ({ schema, id }),
  failureAction: ({ schema, id }) => ({ schema, id }),
  completeAction: ({ schema, id }) => ({ schema, id }),
  checkShouldFire: ({ schema, id }, state) => shouldSaveSelector({ schema, id })(state),

  doAction: function* saveModelSaga(
    { schema, props, id, beforeSave, llClient }
  ) {
    const schemaClass = schemas[schema];
    let model = yield select(state => saveModelSelector({ schema, id })(state));
    if (beforeSave) model = beforeSave(model);

    if (props) {
      const immutableProps = Iterable.isIterable(props) ? props : fromJS(props);
      const safeProps = schemaClass.preSave(immutableProps);
      model = model.merge(safeProps);
    }

    // mark all current client side changes for this model as pending save
    yield put(updateModelActions.makePending(schema, id));

    const { status, body } = yield call(llClient.patchModel, schema, model.toJS());

    // check the status and throw errors if not valid
    if (status >= 300) {
      if (has(body, 'errors') && has(body, 'name') && body.name === 'ValidationError') {
        const errors = { hasErrors: true, messages: {} };

        const fieldErrors = body.errors;
        each(fieldErrors, (val, key) => {
          const messages =
            val.name === 'CastError'
            ? ['Could not accept this value']
            : val.message.split(', ');
          errors.messages[key] = messages;
        });

        yield put(updateModelErrors(schema, id, fromJS(errors)));
      }

      throw new HttpError(body.message || body, {
        status
      });
    }
    const result = normalize(body, schemaClass);
    const entities = entityReviver(result);
    const savedModel = entities.get(schema).first();
    yield put(mergeEntities(entities));

    // discard all client side changes that were pending save
    // we have persisted them to the server
    yield put(updateModelActions.clearPending(schema, id));

    // map the ids against the filter in the pagination store
    return yield { model: savedModel, schema, id };
  }
});

export const selectors = {
  shouldSaveSelector,
  saveModelSelector
};
export const constants = { ...saveModel.constants, ADD_TO_SAVE_QUEUE };
export const reducers = saveModel.reducers;
export const actions = saveModel.actions;
export const sagas = saveModel.sagas;
