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

const sendRequest = (statement, statementForwarding) => {
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
  }).then((response) => {
    if (!(response.status >= 200 && response.status < 400)) {
      throw new ForwardingRequestError(
        `Status code was invalid: (${response.status})`,
        response.body,
      );
    }
    return response;
  });

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

const statementForwardingRequestHandler = (
  { statement, statementForwarding },
  done
) => {
  const updatePendingPromise = setPendingStatements(
    statement,
    statementForwarding._id
  );

  const sendRequestPromise = sendRequest(
    statement.statement,
    statementForwarding
  ).then(() =>
    // set to complete
    updatePendingPromise
      .then(() => setCompleteStatements(statement, statementForwarding._id))
      .then(() => {
        logger.debug(
          `SUCCESS sending statement to ${statementForwarding.configuration.url}`
        );
        done();
      })
  ).catch((err) => {
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

    const updateFailedLogPromise = Statement.findByIdAndUpdate(
      statement._id,
      {
        $addToSet: {
          failedForwardingLog: update
        }
      }
    ).catch((err) => {
      logger.error('Failed updating failedForwardingLog', err);
    });

    Promise.all([updatePendingPromise, updateFailedLogPromise]).then(() => {
      done(err);
    });
  });

  const outPromise = Promise.all([updatePendingPromise, sendRequestPromise]);
  return outPromise;
};

export default statementForwardingRequestHandler;
