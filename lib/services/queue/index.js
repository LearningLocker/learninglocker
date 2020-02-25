/* eslint-disable import/no-dynamic-require */
import logger from 'lib/logger';
import * as bullProvider from './bull';
import * as sqsProvider from './sqs';
import * as localProvider from './local';
import * as pubsubProvider from './pubsub';
import queueConfigFactory from './queueConfigFactory';
import * as serviceBusProvider from './serviceBus';

/**
 * @callback queue~defaultCallback
 *  @param {Error | *} [error]
 */

/** @param {Error | *} [err] */
const defaultCallback = (err) => {
  if (err) logger.error('QUEUE DEFAULT ERROR', err);
};

/**
 * @callback getProvider~done
 *  @param {Error | null} error
 *  @param {*} [provider]
 */

/**
 * @param {string} queueProvider
 * @param {getProvider~done} done
 * @returns {*}
 */
const getProvider = ({ queueProvider = process.env.QUEUE_PROVIDER }, done) => {
  switch (queueProvider) {
    case 'PUBSUB': return done(null, pubsubProvider);
    case 'SQS': return done(null, sqsProvider);
    case 'SERVICE_BUS': return done(null, serviceBusProvider);
    case 'REDIS':
    case 'BULL':
      return done(null, bullProvider);
    case 'LOCAL': return done(null, localProvider);
    default: return done(new Error(`${queueProvider} is not a valid queue provider`));
  }
};

// TODO, remove
export const getPrefixedQueueName = queueName => `${process.env.QUEUE_NAMESPACE}_${queueName}`;

/**
 * @param {string} queueName
 * @param payload
 * @param deadLetter
 * @param {queue~defaultCallback | function} done
 * @returns {Promise<void>}
 */
export const publish = (
  {
    queueName,
    payload,
    deadLetter
  },
  done = defaultCallback
) => new Promise(
  (resolve, reject) => {
    getProvider({}, (getProviderError, provider) => {
      if (getProviderError) {
        return reject(getProviderError);
      }

      const prefixedQueueName = getPrefixedQueueName(queueName);
      const queueConfig = queueConfigFactory(queueName);

      provider.publish(
        {
          queueName: prefixedQueueName,
          payload,
          ...queueConfig
        },
        (publishError, queue) => {
          if (publishError) {
            return reject(publishError);
          }

          resolve(queue);
        }
      );
    });
  }
)
  .then(queue => done(null, queue))
  .catch(err => done(err));

/**
 * @param {string} queueName
 * @param handler
 * @param onProcessed
 * @param {queue~defaultCallback} done
 * @returns {Promise<void>}
 */
export const subscribe = (
  {
    queueName,
    handler,
    onProcessed,
  },
  done = defaultCallback
) => new Promise(
  (resolve, reject) => {
    getProvider({}, (getProviderError, provider) => {
      if (getProviderError) {
        return reject(getProviderError);
      }

      const prefixedQueueName = getPrefixedQueueName(queueName);
      const config = queueConfigFactory(queueName);

      provider.subscribe(
        {
          queueName: prefixedQueueName,
          handler,
          onProcessed,
          ...config,
        },
        (subscribeError) => {
          if (subscribeError) {
            return reject(subscribeError);
          }

          resolve();
        }
      );
    });
  }
)
  .then(res => done(null, res))
  .catch(err => done(err));

// For testing
export const unsubscribeAll = () =>
  new Promise((resolve, reject) => {
    getProvider({}, (err, provider) => {
      if (err) reject(err);
      return resolve(provider.unsubscribeAll());
    });
  });
