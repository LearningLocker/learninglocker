import logger from 'lib/logger';
import Statement from 'lib/models/statement';
import statementHandler from 'worker/handlers/statement/statementHandler';
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
  const statementStream = highland(Statement.find(query).cursor());

  statementStream.on('error', (err) => {
    logger.error(err);
    process.exit();
  });

  const queueAddStream = statementStream.flatMap((statement) => {
    // do something with the mongoose document
    const promise = new Promise((resolve, reject) => {
      statementHandler({ statementId: statement._id }, (err) => {
        if (err) return reject(err);
        return resolve();
      });
    });
    return highland(promise);
  });

  queueAddStream.reduce(0, (val) => {
    const newValue = val + 1;
    if (newValue % 100 === 0) logger.debug(`Batch of complete. Added ${newValue}`);
    return newValue;
  }).flatten().apply((totalCount) => {
    logger.debug(`Added ${totalCount} statements back to the queue.`);
    process.exit();
  });
}
