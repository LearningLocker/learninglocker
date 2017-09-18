import { createSelector } from 'reselect';
import { Map, Set, OrderedSet, OrderedMap } from 'immutable';
import * as fetchModelsDuck from 'ui/redux/modules/pagination/fetchModels';
import { idSelector } from 'ui/redux/modules/clientIds/selectors';

const modelsSelector = state => state.models;

/**
 * Returns the the cache of local unsaved state for a schema and an id
 */
const localUnsavedSchemaIdSelector = (schema, id) => createSelector(
  modelsSelector,
  models => models.getIn([schema, id, 'localCache', 'unsaved'])
);

/**
 * Returns the the cache of local pending state for a schema and an id
 */
const localPendingSchemaIdSelector = (schema, id) => createSelector(
  modelsSelector,
  models => models.getIn([schema, id, 'localCache', 'pending'])
);

/**
 * Returns a single model from the local cache by merging pending and unsaved states
 * @param {String} schema e.g 'user'
 * @param {String} id e.g '58b6e794824d4624fc68f6b3'
 */
const localModelSchemaIdSelector = (schema, id) => createSelector(
  [localUnsavedSchemaIdSelector(schema, id), localPendingSchemaIdSelector(schema, id)],
  (unsavedModel = new Map(), pendingModel = new Map()) => pendingModel.merge(unsavedModel)
);

/**
 * Returns a single model from the remote cache
 * @param {String} schema e.g 'user'
 * @param {String} id e.g '58b6e794824d4624fc68f6b3'
 */
const remoteModelSchemaIdSelector = (schema, id) => createSelector(
  modelsSelector,
  models => models.getIn([schema, id, 'remoteCache'])
);

/**
 * Returns a model made by combining local and remote caches
 * @param {String} schema e.g 'user'
 * @param {String} id e.g '58b6e794824d4624fc68f6b3'
 */
const modelsSchemaIdSelector = (schema, id) => createSelector(
  [localModelSchemaIdSelector(schema, id), remoteModelSchemaIdSelector(schema, id)],
  (localModel = new Map(), remoteModel = new Map()) => {
    const out = remoteModel.merge(localModel);
    return out;
  }
);

/**
 * gets a collection by a list of ids
 * @param  {String}          schema  schema to search in e.g. 'statement'
 * @param  {Immutable.Set}   ids     mongo query object or filter function taking a model as the arg
 * @return {Immutable.Map}           Map of objects of type [schema] matching the filter
 */
const modelsPickSelector = (schema, ids = new Set()) => createSelector(
  [state => state, idSelector(ids)],
  (state, actualIds) => {
    const idSet = OrderedSet.isOrderedSet(actualIds) ? actualIds : actualIds.toOrderedSet();
    return new OrderedMap(idSet.map((id) => {
      const model = modelsSchemaIdSelector(schema, id)(state);
      if (model.isEmpty()) return null;
      return [id, model];
    }));
  }
);

/**
 * gets a model of the specified schema filtered by a mongo query
 * this is the standard way to get a collection of models
 * @param  {String}          options.schema  schema to search in e.g. 'statement'
 * @param  {Object/Function} options.filter  mongo query object or filter function
 *                                           taking a model as the arg
 * @return {Immutable.Map}                   Map of objects of type [schema] matching the filter
 */
const modelsByFilterSelector = (schema, filter, sort) => createSelector(
    [state => state, fetchModelsDuck.selectors.idsByFilterSelector(schema, filter, sort)],
    (state, ids) =>
      modelsPickSelector(schema, ids)(state)
  );

export {
  modelsSelector,
  modelsSchemaIdSelector,
  modelsByFilterSelector,
  localModelSchemaIdSelector,
  localUnsavedSchemaIdSelector,
  localPendingSchemaIdSelector,
  remoteModelSchemaIdSelector
};
