/* eslint-disable import/no-dynamic-require */
import logger from 'lib/logger';
import * as bullProvider from './bull';
import * as sqsProvider from './sqs';
import * as localProvider from './local';
import queueConfigFactory from './queueConfigFactory';

const defaultCallback = (err) => {
  if (err) logger.error('QUEUE DEFAULT ERROR', err);
};


const getProvider = ({ queueProvider = process.env.QUEUE_PROVIDER }, done) => {
  switch (queueProvider) {
    case 'SQS': return done(null, sqsProvider);
    case 'REDIS':
    case 'BULL':
      return done(null, bullProvider);
    case 'LOCAL': return done(null, localProvider);
    default: return done(new Error(`${queueProvider} is not a valid queue provider`));
  }
};

// TODO, remove
export const getPrefixedQueueName = queueName => `${process.env.QUEUE_NAMESPACE}_${queueName}`;

export const publish = ({ queueName, payload, deadLetter }, done = defaultCallback) => {
  const out = new Promise((resolve, reject) => {
    getProvider({}, (err, provider) => {
      if (err) return reject(err);
      const prefixedQueueName = getPrefixedQueueName(queueName);

      const queueConfig = queueConfigFactory(queueName);

      provider.publish({
        queueName: prefixedQueueName,
        payload,
        ...queueConfig
      }, (err, queue) => {
        if (err) return reject(err);
        resolve(queue);
      });
    });
  })
  .then(queue => done(null, queue))
  .catch(err => done(err));
  return out;
};

export const subscribe = ({
  queueName,
  handler,
  onProcessed,
}, done = defaultCallback) =>
  new Promise((resolve, reject) => {
    getProvider({}, (err, provider) => {
      if (err) return reject(err);
      const prefixedQueueName = getPrefixedQueueName(queueName);

      const config = queueConfigFactory(queueName);

      provider.subscribe({
        queueName: prefixedQueueName,
        handler,
        onProcessed,
        ...config,
      }, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  })
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
