import logger from 'lib/logger';
import {
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  STATEMENT_FORWARDING_QUEUE,
} from 'lib/constants/statements';

/**
 * allowable Worker Queues
 *
 * @type {string[]}
 */
const allowableWorkerQueues = [
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  STATEMENT_FORWARDING_QUEUE,
];

/**
 * @param {string | undefined} allowedWorkerQueuesString
 * @return {string[]}
 * @throws {Error}
 */
const getAllowedWorkerQueues = (allowedWorkerQueuesString) => {
  if (allowedWorkerQueuesString === undefined) {
    return allowableWorkerQueues;
  }

  if (allowedWorkerQueuesString === '') {
    return [];
  }

  return allowedWorkerQueuesString.split(',').reduce(
    (acc, queueString) => {
      if (allowableWorkerQueues.includes(queueString)) {
        return acc.concat([queueString]);
      }
      logger.warn(`"${queueString}" is ignored as an allowed worker queue. Allowable worker queues are ${allowableWorkerQueues.map(q => `"${q}"`).join(', ')}`);
      return acc;
    },
    [],
  );
};

/**
 * @type {string[]}
 */
const allowedWorkerQueues = getAllowedWorkerQueues(process.env.ALLOWED_WORKER_QUEUES);

/* eslint-disable import/prefer-default-export*/
export const isAllowedWorkerQueue = queueName => allowedWorkerQueues.includes(queueName);
