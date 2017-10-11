import { createSelector } from 'reselect';
import { call, put } from 'redux-saga/effects';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import * as clearModelsCacheDuck from 'ui/redux/modules/pagination/clearModelsCache';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { modelsSelector } from 'ui/redux/modules/models/selectors';

const deleteStateSelector = schema => createSelector(
  [modelsSelector],
  models => models.getIn([schema, 'deleteState'], false)
);

const shouldDeleteSelector = schema => createSelector(
  [deleteStateSelector(schema)],
  deleteState =>
    (deleteState !== IN_PROGRESS && deleteState !== COMPLETED && deleteState !== FAILED)
);

const deleteModel = createAsyncDuck({
  actionName: 'learninglocker/models/DELETE_MODEL',

  successDelay: 2000,
  failureDelay: 2000,

  reduceStart: (state, { schema, id }) =>
    state.setIn([schema, id, 'deleteState'], IN_PROGRESS),
  reduceSuccess: (state, { schema, id }) =>
    state.setIn([schema, id, 'deleteState'], COMPLETED),
  reduceFailure: (state, { schema, id }) =>
    state.setIn([schema, id, 'deleteState'], FAILED),
  reduceComplete: (state, { schema, id }) =>
    state.setIn([schema, id, 'deleteState'], null),

  startAction: ({ schema, id }) => ({ schema, id }),
  successAction: ({ schema, id }) => ({ schema, id }),
  failureAction: ({ schema, id, message }) => ({ schema, id, message }),
  completeAction: ({ schema, id }) => ({ schema, id }),
  checkShouldFire: ({ schema }, state) => shouldDeleteSelector({ schema })(state),

  doAction: function* deleteModelSaga({ schema, id, llClient }) {
    const { status, body } = yield call(llClient.deleteModel, schema, { _id: id });

    if (status >= 300) {
      const message = body.message || body;
      throw new Error(message);
    }

    // check the status and throw errors if not valid
    yield put(clearModelsCacheDuck.actions.clearModelsCache({ schema }));

    // map the ids against the filter in the pagination store
    return yield { schema, id };
  }
});

export const selectors = { shouldDeleteSelector };
export const constants = deleteModel.constants;
export const reducers = deleteModel.reducers;
export const actions = deleteModel.actions;
export const sagas = deleteModel.sagas;
