import logger from 'lib/logger';
import { filter } from 'lodash';
import { STATEMENT_QUERYBUILDERCACHE_QUEUE } from 'lib/constants/statements';
import Statement from 'lib/models/statement';
import statementHandler from 'worker/handlers/statement/statementHandler';

export default async (statementId) => {
  if (!statementId) {
    logger.error('statementId required');
    return;
  }

  // RESET THE STATEMENT
  const statement = await Statement.findById(statementId);

  statement.completedQueues = filter(
    statement.completedQueues,
    item => item !== STATEMENT_QUERYBUILDERCACHE_QUEUE
  );
  statement.processingQueues = filter(
    statement.completedQueues,
    item => item !== STATEMENT_QUERYBUILDERCACHE_QUEUE
  );

  await statement.save();

  // PUSH IT THROUGH THE QUEUE
  await new Promise((resolve, reject) =>
    statementHandler({ statementId }, (err) => {
      if (err) return reject(err);
      return resolve();
    })
  );
  logger.info('FINISHED');
  process.exit();
};
