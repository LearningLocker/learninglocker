import logger from 'lib/logger';
import getPersonaService from 'lib/connections/personaService';

const personaService = getPersonaService();

const createPersonaIndexes = () => {
  personaService.migrate();
};

const up = async () => {
  createPersonaIndexes();
};

const down = async () => {
  logger.info('This migration created indexes that may be useful, please remove them manually.');
};

export default { up, down };
