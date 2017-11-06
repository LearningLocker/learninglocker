import logger from 'lib/logger';
import extractPersonasHandler from 'worker/handlers/statement/extractPersonasHandler';
import queryBuilderCacheHandler from 'worker/handlers/statement/queryBuilderCacheHandler';
import defaultStatementHandler from 'worker/handlers/statement/statementHandler';
import listenForV1 from 'worker/handlers/statement/listenForV1';
import * as Queue from 'lib/services/queue';
import statementForwardingHandler from
  'worker/handlers/statement/statementForwarding/statementForwardingHandler';
import statementForwardingRequestHandler from
  'worker/handlers/statement/statementForwarding/statementForwardingRequestHandler';
import statementForwardingDeadLetterHandler from
  'worker/handlers/statement/statementForwarding/statementForwardingDeadLetterHandler';

import {
  STATEMENT_QUEUE,
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  STATEMENT_FORWARDING_QUEUE,
  STATEMENT_FORWARDING_REQUEST_QUEUE,
  STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE,
  STATEMENT_FORWARDING_DEADLETTER_QUEUE
} from 'lib/constants/statements';

const defaultHandleResponse = (err) => {
  if (err) logger.error('ERROR SUBSCRIBING TO QUEUE', err);
  return err;
};

export default (
{
  handleResponse = defaultHandleResponse,
  statementHandler = defaultStatementHandler,
  statementHandlerEmpty,
  statementHandlerProccessed
}
) => {
  // GET NOTIFICATIONS FROM V1. Keep this until statement API is moved to node
  listenForV1();

  Queue.subscribe({
    queueName: STATEMENT_QUEUE,
    handler: statementHandler,
    onEmpty: statementHandlerEmpty,
    onProccessed: statementHandlerProccessed
  }, handleResponse);

  Queue.subscribe({
    queueName: STATEMENT_EXTRACT_PERSONAS_QUEUE,
    handler: extractPersonasHandler
  }, handleResponse);

  Queue.subscribe({
    queueName: STATEMENT_QUERYBUILDERCACHE_QUEUE,
    handler: queryBuilderCacheHandler
  }, handleResponse);

  Queue.subscribe({
    queueName: STATEMENT_FORWARDING_QUEUE,
    handler: statementForwardingHandler
  }, handleResponse);

  const RETRY_DELAY = 900; // 900 (15 minutes, max allowed DelaySeconds: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html)

  Queue.subscribe({
    queueName: STATEMENT_FORWARDING_REQUEST_QUEUE,
    handler: statementForwardingRequestHandler,
    deadLetter: STATEMENT_FORWARDING_DEADLETTER_QUEUE,
  }, handleResponse);

  Queue.subscribe({
    queueName: STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE,
    handler: statementForwardingRequestHandler,
    deadLetter: STATEMENT_FORWARDING_DEADLETTER_QUEUE,
    retryDelay: RETRY_DELAY
  }, handleResponse);

  Queue.subscribe({
    queueName: STATEMENT_FORWARDING_DEADLETTER_QUEUE,
    handler: statementForwardingDeadLetterHandler,
  }, handleResponse);
};
