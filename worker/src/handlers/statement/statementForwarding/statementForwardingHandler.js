import wrapHandlerForStatement from 'worker/handlers/statement/wrapHandlerForStatement';
import {
  STATEMENT_FORWARDING_QUEUE,
  STATEMENT_FORWARDING_REQUEST_QUEUE,
  STATEMENT_FORWARDING_DEADLETTER_QUEUE
} from 'lib/constants/statements';
import StatementForwarding from 'lib/models/statementForwarding';
import { map } from 'lodash';

import mongoose from 'mongoose';
import * as Queue from 'lib/services/queue';
import logger from 'lib/logger';
import mongoFilteringInMemory from 'lib/helpers/mongoFilteringInMemory';
import parseQuery from 'lib/helpers/parseQuery';

const objectId = mongoose.Types.ObjectId;

export default wrapHandlerForStatement(STATEMENT_FORWARDING_QUEUE, (statement, done, {
  queue = Queue
} = {}) =>
  StatementForwarding.find({
    organisation: objectId(statement.organisation),
    active: true
  }).then((statementForwardings) => {
    const promises = map(statementForwardings, async (statementForwarding) => {
      const queueName = STATEMENT_FORWARDING_REQUEST_QUEUE;

      const query = statementForwarding.query && JSON.parse(statementForwarding.query);
      const parsedQuery = await parseQuery(query);

      return new Promise((resolve, reject) => {
        const theParsedQuery = parsedQuery && (parsedQuery.$match || parsedQuery);
        if (theParsedQuery && !mongoFilteringInMemory(theParsedQuery)(statement)) {
          return resolve();
        }

        queue.publish({
          queueName,
          payload: {
            status: queueName,
            statement,
            statementForwarding
          },
          deadLetter: STATEMENT_FORWARDING_DEADLETTER_QUEUE,
          opts: { lifo: true }
        }, (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });

    return Promise.all(promises);
  }).then(() => {
    logger.debug('SUCCESS adding forwarding statement to forwarding statement request queue');
    return done();
  }).catch((err) => {
    logger.error('FAILED adding forwarding statement to forwarding statement request queue');
    return done(err);
  })
);
