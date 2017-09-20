import {
  queryBuilderCacheStatementHandler
} from 'worker/handlers/statement/queryBuilderCacheHandler';
import {
  extractPersonasStatementHandler
} from 'worker/handlers/statement/extractPersonasHandler';
import {
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
} from 'lib/constants/statements';
import { map } from 'lodash';
import logger from 'lib/logger';
import Statement from 'lib/models/statement';
import highland from 'highland';
import Promise from 'bluebird';

export default function (query, jobType, batchSize = 1000) {
  let jobHandler;

  switch (jobType) {
    default:
      logger.info(`No handler found for ${jobType}`);
      process.exit();
      break;
    case STATEMENT_QUERYBUILDERCACHE_QUEUE:
      jobHandler = queryBuilderCacheStatementHandler;
      break;
    case STATEMENT_EXTRACT_PERSONAS_QUEUE:
      jobHandler = extractPersonasStatementHandler;
      break;
  }

  if (!query) {
    query = {};
  }
  query.completedQueues = { $nin: [jobType] };

  logger.info('Counting total statements...');
  logger.debug('Query...', query);

  const handleJob = Promise.promisify(jobHandler);

  let totalHandled = 0;
  logger.info(`Batching in groups of ${batchSize}`);

  const statementStream = highland(Statement.find(query).lean().batchSize(batchSize).cursor());

  const handler = statementStream.batch(Number(batchSize)).flatMap((statements) => {
    const updateIDs = map(statements, statement => statement._id);

    const promise = handleJob(statements).catch((err) => {
      logger.error(err);
      return err;
    });

    const allJobsDone = promise
      .then(() => {
        totalHandled += statements.length;
        logger.info(`Finished batch of ${statements.length} (${totalHandled})`);
        return Statement.update(
          { _id: { $in: updateIDs } },
          {
            $addToSet: { completedQueues: jobType },
            $pull: { processingQueues: jobType }
          },
          { multi: true })
          .exec();
      })
      .catch((err) => {
        logger.error(err);
      });

    return highland(allJobsDone);
  });

  handler.apply(() => {
    logger.info(`Ran handler on ${totalHandled} statements.`);
    process.exit();
  });
}
