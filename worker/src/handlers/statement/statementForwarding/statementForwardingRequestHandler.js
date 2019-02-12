import * as popsicle from 'popsicle';
import { assign, isPlainObject } from 'lodash';
import { Map } from 'immutable';
import logger from 'lib/logger';
import Statement, { mapDot } from 'lib/models/statement';
import mongoose from 'mongoose';
import StatementForwarding from 'lib/models/statementForwarding';
import ForwardingRequestError from
  'worker/handlers/statement/statementForwarding/ForwardingRequestError';
import {
  STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE,
} from 'lib/constants/statements';
import * as Queue from 'lib/services/queue';

const objectId = mongoose.Types.ObjectId;

const generateHeaders = (statementContent, statementForwarding, statement) => {
  const headersWithLength = new Map({
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(statementContent)
  });
  const statementForwardingModel = new StatementForwarding(statementForwarding);
  const headersWithAuthAndLength =
    headersWithLength.merge(statementForwardingModel.getAuthHeaders());

  const headersWithAuthAndLengthAndHeaders =
  headersWithAuthAndLength.merge(statementForwardingModel.getHeaders(statement));

  return headersWithAuthAndLengthAndHeaders.toJS();
};

const sendRequest = async (statementToSend, statementForwarding, fullStatement) => {
  const urlString = `${statementForwarding.configuration
    .protocol}://${statementForwarding.configuration.url}`;

  const statementContent = JSON.stringify(mapDot(
    statementToSend
  ));

  const headers = generateHeaders(statementContent, statementForwarding, fullStatement);

  const requestOptions = {
    method: 'POST',
    body: mapDot(statementToSend),
    url: urlString,
    headers,
    timeout: 5000,
    options: {
      followRedirects: (() => true)
    }
  };
  try {
    const request = popsicle.request(requestOptions);
    const response = await request;
    if (!(response.status >= 200 && response.status < 400)) {
      throw new ForwardingRequestError(
        'Status code was invalid',
        {
          headers: requestOptions.headers,
          responseBody: response.body,
          responseStatus: response.status,
          url: requestOptions.url,
        }
      );
    }

    return request;
  } catch (err) {
    if (err instanceof ForwardingRequestError) {
      throw err;
    }
    throw new ForwardingRequestError(
      err.message,
      {
        headers: requestOptions.headers,
        responseBody: null,
        responseStatus: null,
        url: requestOptions.url,
      }
    );
  }
};

const setPendingStatements = (statement, statementForwardingId) =>
  Statement.update({ _id: statement._id }, {
    $addToSet: {
      pendingForwardingQueue: statementForwardingId
    }
  });

const setCompleteStatements = (statement, statementForwardingId) =>
  Statement.update({ _id: statement._id }, {
    $addToSet: {
      completedForwardingQueue: statementForwardingId
    },
    $pull: {
      pendingForwardingQueue: statementForwardingId
    }
  });

const statementForwardingRequestHandler = async (
  { statement, statementForwarding },
  done,
  {
    queue = Queue
  } = {}
) => {
  try {
    await setPendingStatements(
      statement,
      statementForwarding._id
    );

    await sendRequest(
      statementForwarding.fullDocument ? statement : statement.statement,
      statementForwarding,
      statement
    );

    await setCompleteStatements(statement, statementForwarding._id);

    logger.debug(
      `SUCCESS sending statement ${statement._id} to ${statementForwarding.configuration.url}`
    );

    done();
  } catch (err) {
    logger.info(
      `FAILED sending statement ${statement._id} to ${statementForwarding.configuration.url}`,
      err
    );

    let update = {
      timestamp: new Date(),
      statementForwarding_id: objectId(statementForwarding._id),
      message: err.toString()
    };

    if (err.messageBody) {
      if (isPlainObject(err.messageBody)) {
        update = assign({}, update, { errorInfo: err.messageBody });
      }
    }

    try {
      const updatedStatement = await Statement.findByIdAndUpdate(
        statement._id,
        {
          $addToSet: {
            failedForwardingLog: update
          }
        },
        {
          new: true,
        }
      );

      if (
        updatedStatement.failedForwardingLog.length <=
          statementForwarding.configuration.maxRetries
      ) {
        logger.info(`SENDING statement ${updatedStatement._id} to ${STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE}`);
        queue.publish({
          queueName: STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE,
          payload: {
            status: STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE,
            statement: updatedStatement,
            statementForwarding
          }
        }, (err) => {
          if (err) {
            logger.error(`FAILED sending statement ${updatedStatement._id} to ${STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE}`, err);
            done(err);
            throw new Error('Error publishing to queue');
          }
          done();
          return;
        });
      } else {
        logger.info(`EXCEEDED max retry for statement ${updatedStatement._id}, failing (should go to dead letter queue).`);
        done(err); // failed, let redrive send to dead letter queue
      }
    } catch (err) {
      logger.error('Failed updating failedForwardingLog', err);
    }
  }

  return [statement._id];
};

export default statementForwardingRequestHandler;
