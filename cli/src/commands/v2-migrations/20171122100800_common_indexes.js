import { getConnection } from 'lib/connections/mongoose';
import logger from 'lib/logger';

const createIndex = (collection, name, index, opts = {}) => {
  logger.silly(`Creating ${name} index`, index);
  return collection.createIndex(index, { name, background: true, ...opts });
};

const createUnique = (collection, name, index, opts = {}) =>
  createIndex(collection, name, index, { unique: true, ...opts });

const createStatementIndexes = (connection) => {
  const stmts = connection.collection('statements');

  const objectIdIndex = { 'statement.object.id': 1 };
  const verbIdIndex = { 'statement.verb.id': 1 };
  const objectTypeIndex = { 'statement.object.objectType': 1 };
  const accountIndex = { 'statement.actor.account.name': 1, 'statement.actor.account.homePage': 1 };

  const createIndexWithOrg = (name, index) =>
    createIndex(stmts, `org_${name}`, { organisation: 1, ...index });
  const createIndexWithStore = (name, index) =>
    createIndexWithOrg(`lrs_${name}`, { lrs_id: 1, ...index });
  const createIndexWithVoid = (name, index) =>
    createIndexWithStore(`voided_${name}`, { voided: 1, ...index });

  createIndexWithOrg('objId_objType', { ...objectIdIndex, ...objectTypeIndex });
  createIndexWithVoid('verbId_objType', { ...verbIdIndex, ...objectTypeIndex });
  createIndexWithVoid('verbId_objId', { ...verbIdIndex, ...objectIdIndex });
  createIndexWithVoid('mbox', { 'statement.actor.mbox': 1 });
  createIndexWithVoid('account', accountIndex);
  createIndexWithVoid('timestamp__id', { timestamp: -1, _id: -1 });
  createIndexWithVoid('stored__id', { stored: -1, _id: -1 });
  createIndexWithStore('statementId', { 'statement.id': 1 });
  createIndexWithOrg('timestamp__id', { timestamp: -1, _id: 1 });
  createIndexWithOrg('stored__id', { stored: -1, _id: 1 });
  createIndexWithOrg('objId', objectIdIndex);
  createIndexWithOrg('verbId_objId', { ...verbIdIndex, ...objectIdIndex });
  createIndexWithOrg('ident', { personaIdentifier: 1 });
  createIndexWithOrg('person_timestamp', { 'person._id': 1, timestamp: -1 });
  createIndexWithOrg('voided', { voided: 1 });
  createUnique(stmts, 'org_lrs_hash', { organisation: 1, lrs_id: 1, hash: 1 });
};

const createClientIndexes = (connection) => {
  const clients = connection.collection('client');
  createUnique(clients, 'apiKey_apiSecret', { 'api.basic_key': 1, 'api.basic_secret': 1 });
};

const createActivityIndexes = (connection) => {
  const fullActivities = connection.collection('fullActivities');
  const activityIndex = { organisation: 1, lrs_id: 1, activityId: 1 };
  createUnique(fullActivities, 'org_lrs_id_activityId', activityIndex);
};

const up = async () => {
  const connection = getConnection();
  createStatementIndexes(connection);
  createClientIndexes(connection);
  createActivityIndexes(connection);
};

const down = async () => {
  logger.info('This migration created indexes that may be useful, please remove them manually.');
};

export default { up, down };
