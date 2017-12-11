import logger from 'lib/logger';
import personasService from 'personas/dist/service';

const createPersonaIndexes = () => {
  personasService.migrate();
};

const up = async () => {
  createPersonaIndexes();
};

const down = async () => {
  logger.info('This migration created indexes that may be useful, please remove them manually.');
};

export default { up, down };
