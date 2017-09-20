import logger from 'lib/logger';
import batcher from 'worker/handlers/statement/batcher';
import {
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
} from 'lib/constants/statements';

export default function (options) {
  const org = options.org || false;
  const lrs = options.lrs || false;
  const dateFrom = options.from || false;
  const dateTo = options.to || false;
  const batchSize = Number(options.batchSize) || 1000;
  let query = options.query || false;
  let jobType;

  switch (options.job) {
    case 'querybuildercache':
      jobType = STATEMENT_QUERYBUILDERCACHE_QUEUE;
      break;
    case 'personas':
      jobType = STATEMENT_EXTRACT_PERSONAS_QUEUE;
      break;
    default:
      logger.info(`Job type '${jobType}' not recognised`);
      process.exit();
      break;
  }

  if (query === false) {
    query = {};
    if (org) {
      query.organisation = org;
    } else if (lrs) {
      query.lrs_id = lrs;
    }

    if (dateFrom || dateTo) query.stored = {};

    if (dateFrom) {
      query.stored.$gte = dateFrom;
    }
    if (dateTo) {
      query.stored.$lt = dateTo;
    }
  }

  logger.info(`Batch handlings jobs for ${jobType} with batch size of ${batchSize}`);
  batcher(query, jobType, batchSize);
}
