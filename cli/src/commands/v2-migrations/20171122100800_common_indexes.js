import Statement from 'lib/models/statement';
import Client from 'lib/models/client';
import { getConnection } from 'lib/connections/mongoose';
import logger from 'lib/logger';

const createIndex = (collection, index, opts = {}) => {
  return collection.createIndex(index, { background: true, ...opts });
};

const createIndexes = (collection, indexes) => {
  return indexes.map(index => {
    return createIndex(collection, index);
  });
};

const orgIndex = { organisation: 1 };
const storeIndex = { ...orgIndex, lrs_id: 1 };
const voidIndex = { ...storeIndex, voided: 1 };

const up = async () => {
  const connection = getConnection();

  const stmts = connection.collection('statements');
  createIndexes(stmts, [
    { ...storeIndex, 'statement.object.id': 1, 'statement.object.objectType': 1 },
    { ...voidIndex, 'statement.verb.id': 1, 'statement.object.objectType': 1 },
    { ...voidIndex, 'statement.verb.id': 1, 'statement.object.id': 1 },
    { ...voidIndex, 'statement.actor.mbox': 1 },
    { ...voidIndex, 'statement.actor.account.name': 1, 'statement.actor.account.homePage': 1 },
    { ...voidIndex, timestamp: -1, _id: -1 },
    { ...voidIndex, stored: -1, _id: -1 },
    { ...storeIndex, 'statement.id': 1 },
    { ...orgIndex, timestamp: -1, _id: 1 },
    { ...orgIndex, stored: -1, _id: 1 },
    { ...orgIndex, 'statement.object.id': 1 },
    { ...orgIndex, 'statement.verb.id': 1, 'statement.object.id': 1 },
    { ...orgIndex, personaIdentifier: 1 },
    { ...orgIndex, 'person._id': 1, timestamp: -1 },
    { ...orgIndex, voided: 1 },
    { stored: -1 },
    { 'person._id': 1 }
  ]);
  createIndex(stmts, { ...storeIndex, hash: 1 }, { unique: true });

  const clients = connection.collection('client');
  createIndex(clients, { 'api.basic_key': 1, 'api.basic_secret': 1 }, { unique: true });

  const fullActivities = connection.collection('fullActivities');
  createIndex(fullActivities, { organisationId: 1, lrsId: 1, activityId: 1 });
};

const down = async () => {
  logger.info('This migration created indexes that may be useful, please remove them manually.');
};

export default { up, down };
