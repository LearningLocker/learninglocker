import logger from 'lib/logger';
import extractPersonasHandler from 'worker/handlers/statement/extractPersonasHandler';
import queryBuilderCacheHandler from 'worker/handlers/statement/queryBuilderCacheHandler';
import defaultStatementHandler from 'worker/handlers/statement/statementHandler';
import listenForRedisPublish from 'worker/handlers/statement/listenForRedisPublish';
import * as Queue from 'lib/services/queue';
import statementForwardingHandler from
  'worker/handlers/statement/statementForwarding/statementForwardingHandler';
import statementForwardingRequestHandler from
  'worker/handlers/statement/statementForwarding/statementForwardingRequestHandler';
import statementForwardingDeadLetterHandler from
  'worker/handlers/statement/statementForwarding/statementForwardingDeadLetterHandler';
import getPersonaService from 'lib/connections/personaService';

import {
  STATEMENT_QUEUE,
  STATEMENT_QUERYBUILDERCACHE_QUEUE,
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  STATEMENT_FORWARDING_QUEUE,
  STATEMENT_FORWARDING_REQUEST_QUEUE,
  STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE,
  STATEMENT_FORWARDING_DEADLETTER_QUEUE
} from 'lib/constants/statements';

import { isAllowedWorkerQueue } from './allowedWorkerQueues';

const defaultHandleResponse = queueName => (err) => {
  if (err) logger.error(`ERROR SUBSCRIBING TO QUEUE ${queueName}`, err);
  return err;
};

export default (
{
  handleResponse = defaultHandleResponse,
  statementHandler = defaultStatementHandler,
  statementHandlerEmpty,
  statementHandlerProcessed
}
) => {
  const personaService = getPersonaService();
  // Get notifications from Redis pub/sub
  listenForRedisPublish();

  Queue.subscribe({
    queueName: STATEMENT_QUEUE,
    handler: statementHandler,
    onEmpty: statementHandlerEmpty,
    onProcessed: statementHandlerProcessed
  }, handleResponse(STATEMENT_QUEUE));

  if (isAllowedWorkerQueue(STATEMENT_EXTRACT_PERSONAS_QUEUE)) {
    Queue.subscribe({
      queueName: STATEMENT_EXTRACT_PERSONAS_QUEUE,
      handler: extractPersonasHandler(personaService)
    }, handleResponse(STATEMENT_EXTRACT_PERSONAS_QUEUE));
  }

  if (isAllowedWorkerQueue(STATEMENT_QUERYBUILDERCACHE_QUEUE)) {
    Queue.subscribe({
      queueName: STATEMENT_QUERYBUILDERCACHE_QUEUE,
      handler: queryBuilderCacheHandler
    }, handleResponse(STATEMENT_QUERYBUILDERCACHE_QUEUE));
  }

  if (isAllowedWorkerQueue(STATEMENT_FORWARDING_QUEUE)) {
    Queue.subscribe({
      queueName: STATEMENT_FORWARDING_QUEUE,
      handler: statementForwardingHandler
    }, handleResponse(STATEMENT_FORWARDING_QUEUE));
  }

  Queue.subscribe({
    queueName: STATEMENT_FORWARDING_REQUEST_QUEUE,
    handler: statementForwardingRequestHandler,
  }, handleResponse(STATEMENT_FORWARDING_REQUEST_QUEUE));

  Queue.subscribe({
    queueName: STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE,
    handler: statementForwardingRequestHandler,
  }, handleResponse(STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE));

  Queue.subscribe({
    queueName: STATEMENT_FORWARDING_DEADLETTER_QUEUE,
    handler: statementForwardingDeadLetterHandler,
  }, handleResponse(STATEMENT_FORWARDING_DEADLETTER_QUEUE));
};
