import Statement from 'lib/models/statement';
import Client from 'lib/models/client';
import { getConnection } from 'lib/connections/mongoose';
import logger from 'lib/logger';

const createIndex = (collection, name, index, opts = {}) => {
  return collection.createIndex(index, { name, background: true, ...opts });
};

const createUnique = (collection, name, index, opts = {}) => {
  return createIndex(collection, name, index, { unique: true, ...opts });
};

const createIndexes = (collection, indexes) => {
  return indexes.map(index => {
    return createIndex(collection, index);
  });
};

const orgIndex = { organisation: 1 };
const storeIndex = { ...orgIndex, lrs_id: 1 };
const voidIndex = { ...storeIndex, voided: 1 };
const objectIdIndex = { 'statement.object.id': 1 };
const verbIdIndex = { 'statement.verb.id': 1 };
const objectTypeIndex = { 'statement.object.objectType': 1 };
const accountIndex = { 'statement.actor.account.name': 1, 'statement.actor.account.homePage': 1 };

const up = async () => {
  const connection = getConnection();

  const stmts = connection.collection('statements');
  createIndex(stmts, 'object', { ...storeIndex, ...objectIdIndex, ...objectTypeIndex });
  createIndex(stmts, 'verb_object_type', { ...voidIndex, ...verbIdIndex, ...objectTypeIndex });
  createIndex(stmts, 'verb_object_id', { ...voidIndex, ...verbIdIndex, ...objectIdIndex });
  createIndex(stmts, 'mbox', { ...voidIndex, 'statement.actor.mbox': 1 });
  createIndex(stmts, 'account', { ...voidIndex, ...accountIndex });
  createIndex(stmts, 'timestamp', { ...voidIndex, timestamp: -1, _id: -1 });
  createIndex(stmts, 'stored', { ...voidIndex, stored: -1, _id: -1 });
  createIndex(stmts, 'statement_id', { ...storeIndex, 'statement.id': 1 });
  createIndex(stmts, 'timestamp_in_org', { ...orgIndex, timestamp: -1, _id: 1 });
  createIndex(stmts, 'stored_in_org', { ...orgIndex, stored: -1, _id: 1 });
  createIndex(stmts, 'object_in_org', { ...orgIndex, ...objectIdIndex });
  createIndex(stmts, 'verb_object_in_org', { ...orgIndex, ...verbIdIndex, ...objectIdIndex });
  createIndex(stmts, 'personaIdentifier', { ...orgIndex, personaIdentifier: 1 });
  createIndex(stmts, 'person', { ...orgIndex, 'person._id': 1, timestamp: -1 });
  createIndex(stmts, 'voided', { ...orgIndex, voided: 1 });
  createUnique(stmts, 'hash', { ...storeIndex, hash: 1 });

  const clients = connection.collection('client');
  createUnique(clients, 'key_secret', { 'api.basic_key': 1, 'api.basic_secret': 1 });

  const fullActivities = connection.collection('fullActivities');
  createUnique(fullActivities, 'activityId', { organisationId: 1, lrsId: 1, activityId: 1 });
};

const down = async () => {
  logger.info('This migration created indexes that may be useful, please remove them manually.');
};

export default { up, down };
