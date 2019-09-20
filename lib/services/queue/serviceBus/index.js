import { memoize, isString } from 'lodash';
import logger from 'lib/logger';
import { ServiceBusClient, ReceiveMode } from '@azure/service-bus';
import azure from 'azure-sb';
import { promisify, map as bmap, delay, race } from 'bluebird';
import moment from 'moment';

let consumers = [];

export const unsubscribeAll = async () => {
  await bmap(consumers, async (consumer) => {
    await consumer.close();
  });
  consumers = [];
};

const connectionString = process.env.SERVICE_BUS_ENDPOINT;

const serviceBusClient = memoize(() => ServiceBusClient.createFromConnectionString(connectionString));

const sbService = memoize((() => azure.createServiceBusService(connectionString)));

const getQueueClient = memoize(async (queueName, {
  visibilityTimeout
} = {}) => {
  const lockDurationSeconds = (visibilityTimeout > 300 ? 300 : visibilityTimeout);
  const lockDuration = moment.duration(lockDurationSeconds, 'seconds').toISOString();

  const options = (visibilityTimeout ?
      { LockDuration: lockDuration } : {}
    );

  const service = sbService();
  await promisify(service.createQueueIfNotExists, {
    context: service
  })(queueName, options);

  return serviceBusClient().createQueueClient(queueName);
}, queueName => queueName);

const getSender = memoize(async (queueName, {
  visibilityTimeout
} = {}) => {
  const queueClient = await getQueueClient(queueName, {
    visibilityTimeout
  });

  const sender = queueClient.createSender();
  return sender;
}, queueName => queueName);

export const subscribe = async ({
  queueName,
  handler,
  onProccessed = () => {},
  deadLetter,
  retryDelay,
  visibilityTimeout,
}, done) => {
  const queueClient = await getQueueClient(queueName, {
    visibilityTimeout
  });

  const receiver = queueClient.createReceiver(ReceiveMode.peekLock);
  receiver.registerMessageHandler(async (brokeredMessage) => {
    let payload;
    try {
      if (isString(brokeredMessage.body)) {
        payload = JSON.parse(brokeredMessage.body);
      } else {
        payload = brokeredMessage.body;
      }
    } catch (err) {
      logger.error(err);
      await brokeredMessage.deadLetter({
        deadLetterErrorDescription: JSON.stringify(err, null, 2),
        deadletterReason: 'Message was not valid JSON'
      });
    }
    try {
      const renewLock = async () => {
        let visibilityTimeoutUpdated = visibilityTimeout;
        while (visibilityTimeoutUpdated > 0) {
          const nextDelay = visibilityTimeoutUpdated < 250 ? visibilityTimeoutUpdated : 250;
          await delay(nextDelay);
          visibilityTimeoutUpdated -= nextDelay;
          if (visibilityTimeoutUpdated > 0) {
            receiver.renewMessageLock(payload);
          }
        }
      };
      const renewLockPromise = renewLock();

      await race(promisify(handler)(payload), renewLockPromise);
    } catch (error) {
      if (deadLetter) {
        const sender = await getSender(deadLetter);
        await sender.send({
          body: {
            ...payload,
            error
          }
        });
      }
    }

    await brokeredMessage.complete();
    onProccessed(brokeredMessage.body);
  }, async (err) => {
    logger.error(`Error processing message for ${queueName}`, err);
  });

  consumers.push(receiver);

  done();
};

// =================================================================================================

export const publish = async ({
  queueName,
  payload,
  retryDelay,
  visibilityTimeout
}, done) => {
  const sender = await getSender(queueName, {
    visibilityTimeout
  });

  let stringPayload;
  try {
    stringPayload = JSON.stringify(payload);
  } catch (err) {
    done(err);
    throw err;
  }

  if (!retryDelay) {
    await sender.send({
      body: stringPayload
    });
  } else {
    await sender.schedualMessage(moment().add(retryDelay, 'seconds').toDate(), {
      body: stringPayload
    });
  }

  done();
};
