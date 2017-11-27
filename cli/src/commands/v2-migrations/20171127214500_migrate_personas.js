import logger from 'lib/logger';
import Persona from 'lib/models/persona';

const up = async () => {
  const filter = {};
  const update = { $unset: { personaIdentifiers: '' } };
  const opts = { multi: true };
  await Persona.collection.update(filter, update, opts);
};

const down = async () => {
  logger.info('Not implemented.');
};

export default { up, down };