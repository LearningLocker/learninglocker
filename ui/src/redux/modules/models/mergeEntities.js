export const MERGE_ENTITIES = 'learninglocker/models/learninglocker/models/MERGE_ENTITIES';

const mergeEntitiesReducer = (state, action) => {
  const { models } = action;
  const nextState = models.reduce(
    (globalState, ids, schema) =>
      ids.reduce(
        (globalStateWithSchema, model, id) =>
          globalStateWithSchema.setIn([schema, id, 'remoteCache'], model),
        globalState
      ),
      state
  );
  return nextState;
};

const mergeEntitiesAction = models => ({
  type: MERGE_ENTITIES,
  models
});

export const reducers = {
  [MERGE_ENTITIES]: mergeEntitiesReducer
};
export const constants = { MERGE_ENTITIES };
export const actions = { mergeEntitiesAction };
export const sagas = [];
