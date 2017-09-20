import Queue from 'bull';
import logger from 'lib/logger';
import { isString, map, forEach } from 'lodash';
import * as redis from 'lib/connections/redis';
import { Promise } from 'bluebird';

const redisOpts = redis.getOptions();

const Bull = {
  queues: {}
};

const logError = queueName => (error) => {
  logger.error(`QUEUE ERROR: ${queueName}`, error);
};

const removeJob = (job) => {
  logger.debug(`REMOVING JOB ${job.jobId}`);
  job.remove();
};

export const getQueue = (queueName, done) => {
  if (!Bull.queues[queueName]) {
    Bull.queues[queueName] = new Queue(
      queueName,
      process.env.REDIS_PORT,
      process.env.REDIS_HOST,
      redisOpts
    )
    .on('error', logError(queueName))
    .on('completed', (job) => {
      logger.debug(`COMPLETED JOB ${job.jobId}`);
      removeJob(job);
    })
    .on('failed', (job, err) => {
      const queue = err.queue || {};
      const failedQueueName = queue.name || 'No queue';
      logger.debug(`JOB ${job.jobId} FAILED`, failedQueueName);
      removeJob(job);
    });
  }
  return done(null, Bull.queues[queueName]);
};

export const publish = ({
  queueName,
  payload
}, done) => {
  getQueue(queueName, (err, queue) => {
    if (err) return done(err);

    return queue.add(payload, {
      removeOnFail: false,
      removeOnComplete: false // Doesn't work ? :(
    }).then(() => {
      done(null);
    }).catch(logError(queueName));
  });
};

const sendDeadLetter = ({ queueName, deadLetter }) => async (data) => {
  let deadLetterFullName;
  if (!deadLetter) {
    return;
  }

  if (isString(deadLetter)) {
    deadLetterFullName = deadLetter;
  } else {
    deadLetterFullName = `${queueName}_DEADLETTER`;
  }

  const deadLetterQueue = await new Promise((resolve, reject) =>
    getQueue(deadLetterFullName, (err, queue) => (err ? reject(err) : resolve(queue)))
  );

  return deadLetterQueue.add(data);
};

export const subscribe = ({
  queueName,
  handler,
  onProccessed = () => {},
  deadLetter
 }, done) => {
  getQueue(queueName, (err, queue) => {
    if (err) return done(err);

    queue.on('completed', (job) => {
      onProccessed({
        Body: JSON.stringify(job.data)
      });
    });

    if (deadLetter) {
      queue.on('failed', (job) => {
        sendDeadLetter({
          queueName,
          deadLetter
        })(job.data);
      });
    }

    try {
      queue.process((job, jobDone) =>
        handler(job.data, jobDone)
      );

      return done(null);
    } catch (err) {
      return done(err);
    }
  });
};

export const unsubscribeAll = () => {
  const queues = map(Bull.queues, queue => queue);
  forEach(queues, ((queue) => {
    queue.handler = null;
  }));
  Bull.queues = {};
};
