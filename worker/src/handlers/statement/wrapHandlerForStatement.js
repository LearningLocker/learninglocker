import logger from 'lib/logger';
import Statement from 'lib/models/statement';
import * as Queue from 'lib/services/queue';
import { STATEMENT_QUEUE } from 'lib/constants/statements';

export default (queueName, statementHandler) => ({ statementId }, jobDone, options) => {
  logger.debug('START', queueName, statementId);
  return Statement.findById(statementId, (err, statement) => {
    if (!statement) {
      logger.info(`Purged job for ${queueName} as statement ${statementId} does not exist`);
      return jobDone();
    }
    statementHandler(statement, (err) => {
      logger.debug('COMPLETED STATEMENT HANDLER FOR', queueName, statementId);
      if (err) {
        return jobDone(err);
      }
      const payload = { status: queueName, statementId };
      try {
        return Queue.publish({
          queueName: STATEMENT_QUEUE,
          payload
        }, jobDone);
      } catch (err) {
        logger.error(`Error publishing status back to ${STATEMENT_QUEUE}`, payload, err);
        return jobDone(err);
      }
    }, options);
  });
};
