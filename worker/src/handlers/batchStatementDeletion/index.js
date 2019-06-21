import logger from 'lib/logger';
import { BATCH_STATEMENT_DELETION_QUEUE } from 'lib/constants/batchDelete';
import * as Queue from 'lib/services/queue';
import batchStatementDeletion from './batchStatementDeletion';

const defaultHandleResponse = (err) => {
  if (err) logger.error(`ERROR SUBSCRIBING TO QUEUE ${BATCH_STATEMENT_DELETION_QUEUE}`, err);
  return err;
};

export default () => {
  Queue.subscribe({
    queueName: BATCH_STATEMENT_DELETION_QUEUE,
    handler: batchStatementDeletion,
  }, defaultHandleResponse);
};
