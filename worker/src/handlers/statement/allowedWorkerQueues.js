import logger from 'lib/logger';
import {
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  STATEMENT_FORWARDING_QUEUE,
} from 'lib/constants/statements';

/**
 * allowable Worker Queues
 *
 * @type {Map<string, true>}
 */
const allowableWorkerQueues = new Map([
  [STATEMENT_QUERYBUILDERCACHE_QUEUE, true],
  [STATEMENT_EXTRACT_PERSONAS_QUEUE, true],
  [STATEMENT_FORWARDING_QUEUE, true],
]);

/**
 * @param {string | undefined} allowedWorkerQueuesString
 * @return {Map<string, true>}
 * @throws {Error}
 */
const getAllowedWorkerQueues = (allowedWorkerQueuesString) => {
  if (allowedWorkerQueuesString === undefined) {
    return allowableWorkerQueues;
  }

  if (allowedWorkerQueuesString === '') {
    return new Map();
  }

  return allowedWorkerQueuesString.split(',').reduce(
    (accMap, queueString) => {
      if (allowableWorkerQueues.has(queueString)) {
        return accMap.set(queueString, queueString);
      }
      logger.warn(`"${queueString}" is ignored as an allowed worker queue. Allowable worker queues are "${STATEMENT_QUERYBUILDERCACHE_QUEUE}", "${STATEMENT_EXTRACT_PERSONAS_QUEUE}", and "${STATEMENT_FORWARDING_QUEUE}"`);
      return accMap;
    },
    new Map(),
  );
};

/**
 * @type {Map<string, true>}
 */
const allowedWorkerQueues = getAllowedWorkerQueues(process.env.ALLOWED_WORKER_QUEUES);

/* eslint-disable import/prefer-default-export*/
export const isAllowedWorkerQueue = (queueName) => allowedWorkerQueues.has(queueName);
