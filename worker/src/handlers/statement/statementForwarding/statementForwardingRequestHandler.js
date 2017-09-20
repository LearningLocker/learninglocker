import * as popsicle from 'popsicle';
import { assign } from 'lodash';
import { Map } from 'immutable';
import logger from 'lib/logger';
import Statement from 'lib/models/statement';
import mongoose from 'mongoose';
import StatementForwarding from 'lib/models/statementForwarding';
import ForwardingRequestError from
  'worker/handlers/statement/statementForwarding/ForwardingRequestError';

const objectId = mongoose.Types.ObjectId;

const generateHeaders = (statementContent, statementForwarding) => {
  const headers1 = new Map({
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(statementContent)
  });
  const statementForwarding2 = new StatementForwarding(statementForwarding);
  const headers2 = headers1.merge(statementForwarding2.getAuthHeaders());
  return headers2.toJS();
};

const sendRequest = async (statement, statementForwarding) => {
  const urlString = `${statementForwarding.configuration
    .protocol}://${statementForwarding.configuration.url}`;

  const statementContent = JSON.stringify(statement);

  const headers = generateHeaders(statementContent, statementForwarding);

  const request = popsicle.request({
    method: 'POST',
    body: statement,
    url: urlString,
    headers,
    timeout: 16000
  });

  const response = await request;
  if (!(response.status >= 200 && response.status < 400)) {
    throw new ForwardingRequestError(
      `Status code was invalid: (${response.status})`,
      response.body,
    );
  }

  return request;
};

const setPendingStatements = (statement, statementForwardingId) =>
  Statement.findByIdAndUpdate(statement._id, {
    $addToSet: {
      pendingForwardingQueue: statementForwardingId
    }
  });

const setCompleteStatements = (statement, statementForwardingId) =>
  Statement.findByIdAndUpdate(statement._id, {
    $addToSet: {
      completedForwardingQueue: statementForwardingId
    },
    $pull: {
      pendingForwardingQueue: statementForwardingId
    }
  });

const statementForwardingRequestHandler = async (
  { statement, statementForwarding },
  done
) => {
  try {
    await setPendingStatements(
      statement,
      statementForwarding._id
    );

    await sendRequest(
      statement.statement,
      statementForwarding
    );

    await setCompleteStatements(statement, statementForwarding._id);

    logger.debug(
      `SUCCESS sending statement to ${statementForwarding.configuration.url}`
    );

    done();
  } catch (err) {
    logger.info(
      `FAILED sending stetement to ${statementForwarding.configuration.url}`,
      err
    );

    let update = {
      timestamp: new Date(),
      statementForwarding_id: objectId(statementForwarding._id),
      message: err.toString()
    };

    if (err.messageBody) {
      update = assign({}, update, {
        messageBody: err.messageBody
      });
    }

    try {
      await Statement.findByIdAndUpdate(
        statement._id,
        {
          $addToSet: {
            failedForwardingLog: update
          }
        }
      );
    } catch (err) {
      logger.error('Failed updating failedForwardingLog', err);
    }

    done(err);
  }

  return [statement._id];
};

export default statementForwardingRequestHandler;
