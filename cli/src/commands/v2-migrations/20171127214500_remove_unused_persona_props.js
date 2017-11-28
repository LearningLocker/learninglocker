import logger from 'lib/logger';
import { getConnection } from 'lib/connections/mongoose';

const up = async () => {
  const connection = getConnection();
  const collection = connection.collection('personas');
  const filter = {};
  const update = { $unset: { personaIdentifiers: '' } };
  const opts = { multi: true };
  await collection.update(filter, update, opts);
};

const down = async () => {
  logger.info('Not implemented.');
};

export default { up, down };
