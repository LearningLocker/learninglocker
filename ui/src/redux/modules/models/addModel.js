import { fromJS } from 'immutable';
import { createSelector } from 'reselect';
import { put, call } from 'redux-saga/effects';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import * as schemas from 'ui/utils/schemas';
import { normalize } from 'normalizr';
import entityReviver from 'ui/redux/modules/models/entityReviver';
import * as mergeEntitiesDuck from 'ui/redux/modules/models/mergeEntities';
import { setInMetadata } from 'ui/redux/modules/metadata';
import * as clearModelsCacheDuck from 'ui/redux/modules/pagination/clearModelsCache';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { modelsSelector } from 'ui/redux/modules/models/selectors';

const addStateSelector = schema => createSelector(
  [modelsSelector],
  models => models.getIn([schema, 'requestState'], false)
);

const shouldAddSelector = schema => createSelector(
  [addStateSelector(schema)],
  addState =>
    (addState !== IN_PROGRESS && addState !== COMPLETED && addState !== FAILED)
);

const addModel = createAsyncDuck({
  actionName: 'learninglocker/models/ADD_MODEL',

  reduceStart: (state, { schema }) => state.setIn([schema, 'requestState'], IN_PROGRESS),
  reduceSuccess: (state, { schema }) => state.setIn([schema, 'requestState'], COMPLETED),
  reduceFailure: (state, { schema }) => state.setIn([schema, 'requestState'], FAILED),
  reduceComplete: (state, { schema }) => state.setIn([schema, 'requestState'], null),

  startAction: ({ schema, props }) => ({ schema, props }),
  successAction: ({ schema }) => ({ schema }),
  failureAction: ({ schema }) => ({ schema }),
  completeAction: ({ schema }) => ({ schema }),
  checkShouldFire: ({ schema }, state) => shouldAddSelector({ schema })(state),

  doAction: function* fetchModelSaga(
    { schema, props, llClient }
  ) {
    const schemaClass = schemas[schema];
    const safeProps = schemaClass.preSave(fromJS(props));
    const { status, body } = yield call(llClient.postModel, schema, safeProps);

    // check the status and throw errors if not valid
    if (status >= 400) {
      if (body.code === 11000 && schema === 'personaIdentifier') {
        throw new Error(
          'Another persona already uses that identifier and it cannot be used twice.'
        );
      }
      const message = body.errmsg || body.message || body;
      throw new Error(message);
    }

    const result = normalize({ ...safeProps.toJS(), ...body }, schemaClass);
    const entities = entityReviver(result);
    const model = entities.get(schema).first();
    yield put(mergeEntitiesDuck.actions.mergeEntitiesAction(entities));
    yield put(clearModelsCacheDuck.actions.clearModelsCache({ schema }));
    const id = model.get('_id');
    yield put(setInMetadata({ schema, id, path: ['isExpanded'], value: true }));
    yield put(setInMetadata({ schema, id, path: ['isNew'], value: true }));
    // map the ids against the filter in the pagination store
    return yield { schema, model };
  }
});

export const selectors = {
  shouldAddSelector
};

export const constants = addModel.constants;
export const reducers = addModel.reducers;
export const actions = addModel.actions;
export const sagas = addModel.sagas;
