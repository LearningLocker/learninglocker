
import Statement from 'lib/models/statement';
import highland from 'highland';
import logger from 'lib/logger';
import {
  keys,
  reject,
  includes,
  intersection,
  size
} from 'lodash';

import * as Queue from 'lib/services/queue';

import {
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  STATEMENT_FORWARDING_QUEUE
} from 'lib/constants/statements';

const queueDependencies = {
  [STATEMENT_QUERYBUILDERCACHE_QUEUE]: {
    preReqs: []
  },
  [STATEMENT_EXTRACT_PERSONAS_QUEUE]: {
    preReqs: []
  },
  [STATEMENT_FORWARDING_QUEUE]: {
    preReqs: []
  },
};

const addStatementToPendingQueues = (statement, queues, done) => {
  if (!statement) return done(new Error('Statement must be provided'));

  const queueNames = keys(queues);
  const pendingQueueNames = reject(queueNames, (queueName) => {
    const queue = queues[queueName];
    const completedQueues = statement.completedQueues || [];
    const processingQueues = statement.processingQueues || [];
    const intersectionQueues = intersection(queue.preReqs, completedQueues);
    // are the preReqs a subset of the queues which have already been completed?
    const preReqsCompleted = intersectionQueues.length === queue.preReqs.length;
    // or is this queue in the completed queues?
    const queueCompleted = includes(completedQueues, queueName);
    // or is this queue in the queues being processed?
    const queueProcessing = includes(processingQueues, queueName);

    return !preReqsCompleted || queueCompleted || queueProcessing;
  });

  return Statement.findByIdAndUpdate(
    statement._id,
    { $addToSet: { processingQueues: {
      $each: pendingQueueNames
    } } },
    (err) => {
      if (err) return done(err);
      // adding to queue returns a promise
      // turns queue names into a stream of promises
      // call done when they have all completed
      return highland(pendingQueueNames).flatMap((queueName) => {
        logger.debug('ADDING STATEMENT TO QUEUE', queueName);
        const response = Queue.publish({
          queueName,
          payload: { statementId: statement._id },
          opts: { lifo: true }
        });
        return highland(response);
      }).apply(() => {
        if (size(pendingQueueNames) > 0) {
          logger.debug(`ADDED ${statement._id} to ${pendingQueueNames.join(', ')}`);
        } else {
          logger.info(`PROCESSED STATEMENT ${statement._id}`);
        }
        return done();
      });
    }
  );
};

export default ({ status, statementId }, jobDone) => {
  try {
    if (status) {
      logger.debug('FINISHED', status, statementId);
      return Statement.findByIdAndUpdate(
        statementId,
        {
          $addToSet: { completedQueues: status },
          $pull: { processingQueues: status }
        },
        { new: true },
        (err, statement) => {
          if (err) logger.error('Statement.findByIdAndUpdate error', err);
          if (err) return jobDone(err);
          // get the statement so that we can find which queues it has already been through
          return addStatementToPendingQueues(statement, queueDependencies, (err) => {
            if (err) logger.error('addStatementToPendingQueues error', err);
            if (jobDone) return jobDone(err);
          });
        }
      );
    }

    logger.debug('NO STATUS', statementId);
    return Statement.findById(
      statementId,
      (err, statement) =>
        addStatementToPendingQueues(statement, queueDependencies, (err) => {
          if (err) logger.error('addStatementToPendingQueues error', err);
          if (jobDone) return jobDone(err);
        })
    );
  } catch (err) {
    logger.error('statementHandler error', err);
    if (jobDone) jobDone(err);
  }
};
