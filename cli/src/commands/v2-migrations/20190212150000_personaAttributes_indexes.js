import { getConnection } from 'lib/connections/mongoose';
import logger from 'lib/logger';

const createIndex = (collection, name, index, opts = {}) => {
  logger.silly(`Creating ${name} index`, index);
  return collection.createIndex(index, { name, background: true, ...opts });
};

const createPersonaAttributesIndexes = (connection) => {
  const personaAttributes = connection.collection('personaAttributes');
  createIndex(personaAttributes, 'personaId_key', { personaId: 1, key: 1 });
};

const up = async () => {
  const connection = getConnection();
  createPersonaAttributesIndexes(connection);
};

const down = async () => {
  logger.info('This migration created indexes that may be useful, please remove them manually.');
};

export default { up, down };
