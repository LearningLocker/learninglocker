import logger from 'lib/logger';
import migrateToInQueries from '../migrateToInQueries';

const up = async () => {
  migrateToInQueries();
};

const down = async () => {
  logger.info('backward migration is not implemented');
};

export default { up, down };
