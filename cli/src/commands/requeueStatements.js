import logger from 'lib/logger';
import Statement from 'lib/models/statement';
import { map } from 'lodash';
import { addStatementToPendingQueues } from 'worker/handlers/statement/statementHandler';
import highland from 'highland';
import moment from 'moment';

export default function (lrsId, options) {
  const since = options.since && moment(new Date(options.since)) || false;

  const query = lrsId ? {
    lrs_id: lrsId
  } : {};

  if (since && since.isValid()) {
    // apply a constraint on stored
    query.stored = { $gte: since.toDate() };
  }

  logger.info('query: ', query);

  logger.info('Looking for statements...');
  const statementStream = highland(Statement.find(query).select({ _id: 1, completedQueues: 1, processingQueues: 1 }).cursor());

  statementStream.on('error', (err) => {
    logger.error(err);
    process.exit();
  });

  const batchSize = 100;

  const queueAddStream = statementStream
    .batch(batchSize)
    .flatMap((statements) => {
      const promises = map(statements, statement =>
        // do something with the mongoose document
         new Promise((resolve, reject) => {
           addStatementToPendingQueues(statement, undefined, (err) => {
             if (err) return reject(err);
             return resolve();
           });
         }));
      return highland(Promise.all(promises));
    });

  queueAddStream.reduce(0, (val) => {
    const newValue = val + batchSize;
    logger.info(`Batch of ${batchSize} complete. Added ${newValue}`);
    return newValue;
  }).flatten().apply((totalCount) => {
    logger.info(`Added ${totalCount} statements back to the queue.`);
    process.exit();
  });
}
