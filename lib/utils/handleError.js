import logger from 'lib/logger';
import { v4 as uuid } from 'uuid';

export default (err) => {
  const errorId = uuid();
  logger.error(errorId, err);
};
