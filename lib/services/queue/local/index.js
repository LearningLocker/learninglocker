import { OrderedMap, Map, List } from 'immutable';
import { uniqueId } from 'lodash';
import logger from 'lib/logger';

/*
  {
    {queueName}: {
      {id}: {
        id: ...,
        payload: ...,
        processing: ...
      },
      ...
    },
    ...
  }
*/
let queues = new OrderedMap();
/*
  {queueName}: [{handler}, ...]
*/
let subscribers = new OrderedMap();

export const getQueue = queueName => queues.get(queueName);

const notifySubscriber = (item, queueName) => {
  logger.debug(`notifying on queue ${queueName}, itemId: ${item.get('id')}`, item.payload);
  const done = (err) => {
    if (err) {
      // Finished prossing, can be prossed again
      logger.debug(`notifying on queue ${queueName}, itemId: ${item.get('id')}, FAILED`);
      queues = queues.setIn([queueName, item.get('id'), 'processing'], false);
      return;
    }

    // processed successfully, remove from queue
    logger.debug(`notifying on queue ${queueName}, itemId: ${item.get('id')}, SUCCESS`);
    queues = queues.deleteIn([queueName, item.get('id')]);
  };

  subscribers.get(queueName, new List()).forEach((handler) => {
    queues = queues.setIn([queueName, item.get('id'), 'processing'], true);
    handler(item.get('payload'), done);
  });
};

const notifySubscribers = () => {
  queues.forEach((queue, queueName) => {
    queue
      .filter(item => !item.get('processing'))
      .forEach((item) => {
        notifySubscriber(item, queueName);
      });
  });
};

export const publish = (
  { queueName, payload },
  done = () => {}
) => {
  logger.debug(`published to ${queueName}`);
  const itemId = uniqueId();
  const queue = queues.get(queueName, new OrderedMap());
  const updatedQueue = queue.set(itemId, new Map({
    id: itemId,
    payload,
    processing: false
  }));
  queues = queues.set(queueName, updatedQueue);

  notifySubscribers();

  done();
};

export const subscribe = (
  {
    queueName,
    handler,
    onProccessed = () => {}
  },
  done = () => {}
) => {
  logger.debug(`Someone subscribed to ${queueName}`);
  const subscribersList = subscribers.get(queueName, new List());

  const handlerWithProccessed = (...args) => {
    const res = handler(...args);
    onProccessed({ // sqs-consumer format
      Body: JSON.stringify(args[0])
    });
    return res;
  };

  const newSubscribersList = subscribersList.push(handlerWithProccessed);
  subscribers = subscribers.set(queueName, newSubscribersList);

  done();
};

export const unsubscribeAll = () => {
  subscribers = new OrderedMap();
};
