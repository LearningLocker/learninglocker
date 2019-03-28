import logger from 'lib/logger';
import Statement from 'lib/models/statement';
import * as Queue from 'lib/services/queue';
import { STATEMENT_QUEUE } from 'lib/constants/statements';

export default (queueName, statementHandler) => ({ statementId }, jobDone, options) => {
  logger.debug('START', queueName, statementId);
  return Statement.findById(statementId, (err, statement) => {
    statementHandler(statement, (err) => {
      logger.debug('COMPLETED STATEMENT HANDLER FOR', queueName, statementId);
      if (err) {
        return jobDone(err);
      }
      try {
        const payload = { status: queueName, statementId };
        return Queue.publish({
          queueName: STATEMENT_QUEUE,
          payload,
          opts: { lifo: true }
        }, jobDone);
      } catch (err) {
        logger.error(`Error publishing status back to ${STATEMENT_QUEUE}`, payload, err);
        return jobDone(err);
      }
    }, options);
  });
};
