import {
  STATEMENT_QUEUE,
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  STATEMENT_FORWARDING_QUEUE,
  STATEMENT_FORWARDING_REQUEST_QUEUE,
  STATEMENT_FORWARDING_DEADLETTER_QUEUE
} from 'lib/constants/statements';
import { map } from 'lodash';
import { getQueueUrl, sqs } from 'lib/services/queue/sqs';
import logger from 'lib/logger';
import { getQueue } from 'lib/services/queue/bull';

const queueNames = [
  STATEMENT_QUEUE,
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  STATEMENT_FORWARDING_QUEUE,
  STATEMENT_FORWARDING_REQUEST_QUEUE,
  STATEMENT_FORWARDING_DEADLETTER_QUEUE
];

export const purgeBullQueues = () => {
  if (
    process.env.QUEUE_PROVIDER !== 'BULL' &&
    process.env.QUEUE_PROVIDER !== 'REDIS'
  ) {
    return Promise.resolve();
  }

  const purgeQueues = map(queueNames, async (item) => {
    const queue = await new Promise((resolve, reject) =>
      getQueue(item, (err, queue2) => (err ? reject(err) : resolve(queue2)))
    );

    if (queue.client.domain !== null || queue.client.options.host !== '127.0.0.1') {
      throw new Error('Attempting to purge non dev queue');
    }

    return queue.empty();
  });

  return Promise.all(purgeQueues);
};

export const purgeSQSQueues = () => { // eslint-disable-line import/prefer-default-export
  if (process.env.QUEUE_PROVIDER !== 'SQS') {
    return Promise.resolve();
  }

  const purgedQueues = map(queueNames, async (item) => {
    const queueUrl = await getQueueUrl(item);
    if (
      !/_DEV_/.test(queueUrl) &&
      !/\/TRAVIS_/.test(queueUrl)
    ) {
      throw new Error('Attempting to purge queues which are not DEV or TRAVIS');
    }

    return new Promise((resolve, reject) =>
      sqs.purgeQueue({ QueueUrl: queueUrl }, (err) => {
        if (err) {
          logger.error('FAILED to purge queue', err);
          return reject(err);
        }
        return resolve();
      })
    );
  });

  return Promise.all(purgedQueues);
};

export const purgeQueues = () => {
  switch (process.env.QUEUE_PROVIDER) {
    case 'REDIS':
    case 'BULL':
      return purgeBullQueues();
    case 'SQS':
      return purgeSQSQueues();
    default:
      return Promise.resolve();
  }
};
