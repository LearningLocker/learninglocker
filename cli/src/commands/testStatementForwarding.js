import { filter } from 'lodash';
import Statement from 'lib/models/statement';
import { STATEMENT_FORWARDING_QUEUE } from 'lib/constants/statements';
import logger from 'lib/logger';
import statementHandler from 'worker/handlers/statement/statementHandler';
import * as http from 'http';

/*
Runs the passed statment id's statement through the statment forwarding queue.
Needs to be run against a running worker-server.
Clears the STATEMENT_FORWARDING_QUEUE from completed and pending mongo queues,
then pushes a message through the statement handler.

A http server will then listen for the request, on the provided --port, if it recieves
the request, this process will exit.

example:
mongo:
statement: {
  _id: ObjectId('theStatementId'),
  organisation: ObjectId('theObjectId')
}
statementForwarding: {
  organisation: ObjectId('theOrganisationId'),
  active: true,
  configuration: {
    protocol: 'http',
    url: 'localhost:3101',
    method: 'POST'
  }
}

node cli/dist/server testStatementForwarding theStatementId --port 3101
*/
export default function (statementId, options = {}) {
  if (!statementId) {
    logger.error('statementId required');
    return;
  }
  return Statement.findById(statementId)
    .then((statement) => { // Remove completed statements.
      // update doc
      statement.completedQueues = filter(
        statement.completedQueues,
        item => item !== STATEMENT_FORWARDING_QUEUE
      );

      statement.processingQueues = filter(
        statement.processingQueues,
        item => item !== STATEMENT_FORWARDING_QUEUE
      );

      return statement.save();
    }).then(() => { // START test http server.
      console.log('port: ', options.port);
      if (!options.port) {
        return;
      }
      http.createServer((request, response) => {
        logger.info('END SUCCESS request headers', request.headers);
        request.on('data', (chunk) => {
          logger.info('END SUCCESS request.body', chunk);
          process.exit();
        });

        response.writeHead(200, {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        });
        response.end('Success\n');
      }).listen(options.port);
    }).then(() => { // push onto the queue
      const promise = new Promise((resolve, reject) => {
        statementHandler({ statementId }, (err) => {
          if (err) return reject(err);
          return resolve();
        });
      });
      return promise;
    })
    .then(() => {
      logger.info('FINISHED SETUP');
      if (!options.port) {
        process.exit();
      }
    });
}
