import { createSelector } from 'reselect';
import moment from 'moment';
import { put, call } from 'redux-saga/effects';
import createAsyncDuck from 'ui/utils/createAsyncDuck';
import * as schemas from 'ui/utils/schemas';
import { normalize } from 'normalizr';
import entityReviver from 'ui/redux/modules/models/entityReviver';
import * as mergeEntitiesDuck from 'ui/redux/modules/models/mergeEntities';
import { IN_PROGRESS, COMPLETED, FAILED } from 'ui/utils/constants';
import { modelsSchemaIdSelector } from 'ui/redux/modules/models/selectors';
import HttpError from 'ui/utils/errors/HttpError';

const cacheDuration = moment.duration({ minute: 3 });

const modelRequestStateSelector = ({ schema, id }) => createSelector(
  [state => state.models],
  model => model.getIn([schema, id, 'requestState'], false)
);

const cachedAtSelector = ({ schema, id }) => createSelector(
  [state => state.models],
  models => models.getIn([schema, id, 'cachedAt'], moment(0))
);

const shouldFetchModelSelector = ({ schema, id, force }) => createSelector(
  [
    state => state,
    modelRequestStateSelector({ schema, id }),
    cachedAtSelector({ schema, id }),
    modelsSchemaIdSelector(schema, id)
  ],
  (state, requestState, cachedAt, model) => {
    if (force) return true;
    if (!schema || !id) return false;
    if (requestState === IN_PROGRESS || requestState === FAILED) return false;
    const cachedFor = moment().diff(cachedAt);
    if (cachedFor < cacheDuration.asMilliseconds()) return false;
    if (model.has('_id')) return false;
    return true;
  }
);

const isLoadingModelSelector = ({ schema, id }) => createSelector(
  [modelRequestStateSelector({ schema, id })],
  requestState => (requestState === IN_PROGRESS)
);

const fetchModel = createAsyncDuck({
  actionName: 'learninglocker/models/FETCH_MODEL',
  failureDelay: 2000,

  reduceStart: (state, action) => {
    const { schema, id } = action;
    return state.setIn([schema, id, 'requestState'], IN_PROGRESS);
  },
  reduceSuccess: (state, action) => {
    const { schema, id } = action;
    return state
      .setIn([schema, id, 'cachedAt'], moment())
      .setIn([schema, id, 'requestState'], COMPLETED);
  },
  reduceFailure: (state, action) => {
    const { schema, id } = action;
    return state
      .setIn([schema, id, 'requestState'], FAILED)
      .setIn([schema, id, 'cachedAt'], moment());
  },
  reduceComplete: (state, action) => {
    const { schema, id } = action;
    return state.setIn([schema, id, 'requestState'], null);
  },

  startAction: ({ schema, id, force }) => ({ schema, id, force }),
  successAction: ({ schema, id }) => ({ schema, id }),
  failureAction: ({ schema, id }) => ({ schema, id }),
  completeAction: ({ schema, id }) => ({ schema, id }),
  checkShouldFire: ({ schema, id, force }, state) => {
    const shouldFetch = shouldFetchModelSelector({ schema, id, force })(state);
    return shouldFetch;
  },
  doAction: function* fetchModelSaga({ schema, id, llClient }) {
    const schemaClass = schemas[schema];
    const { status, body } =
      yield call(llClient.getModel, schema, id);
    if (status >= 300) {
      throw new HttpError(body.message || body, {
        status
      });
    }
    const normalizedModels = normalize(body, schemaClass);
    const entities = entityReviver(normalizedModels);
    const model = entities.getIn([schema, id]);

    // put all of the models into the master record in the model store
    yield put(mergeEntitiesDuck.actions.mergeEntitiesAction(entities));

    // map the ids against the filter in the pagination store
    return yield { schema, id, model };
  }
});

export const selectors = {
  shouldFetchModelSelector,
  isLoadingModelSelector
};

export const reducers = fetchModel.reducers;
export const actions = fetchModel.actions;
export const sagas = fetchModel.sagas;
