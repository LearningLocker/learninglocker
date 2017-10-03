import * as http from 'http';
import * as https from 'https';
import * as URL from 'url';
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


  const url = URL.parse(urlString);

  const statementContent = JSON.stringify(statement);

  const headers = generateHeaders(statementContent, statementForwarding);

  const promise = new Promise((resolve, reject) => {
    const requestHandler = url.protocol === 'https:' ? https : http;
    const request = requestHandler.request(
      {
        host: url.hostname,
        path: url.path,
        port: url.port,
        method: 'POST',
        headers,
        timeout: 16000
      },
      (response) => {
        let responseData = '';
        response.on('data', (data) => {
          responseData = responseData.concat(data.toString());
        });

        response.on('end', () => {
          if (!(response.statusCode >= 200 && response.statusCode < 300)) {
            reject(new ForwardingRequestError(
              `Status code didn't return 200 (${response.statusCode})`,
              responseData,
            ));
            return;
          }

          resolve();
        });
      }
    );

    request.on('error', (err) => {
      if (err) reject(err);
    });

    request.write(statementContent);
    request.end();
  });

  return promise;
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
  )
    .then(() =>
      // set to complete
      updatePendingPromise
        .then(() => setCompleteStatements(statement, statementForwarding._id))
        .then(() => {
          logger.debug(
            `SUCCESS sending statement to ${statementForwarding.configuration.url}`
          );
          done();
        })
    )
    .catch((err) => {
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
