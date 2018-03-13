/* eslint-disable import/no-dynamic-require */
import logger from 'lib/logger';
import * as bullProvider from './bull';
import * as sqsProvider from './sqs';
import * as localProvider from './local';
import * as pubsubProvider from './pubsub';

const defaultCallback = (err) => {
  if (err) logger.error('QUEUE DEFAULT ERROR', err);
};


const getProvider = ({ queueProvider = process.env.QUEUE_PROVIDER }, done) => {
  switch (queueProvider) {
    case 'PUBSUB': return done(null, pubsubProvider);
    case 'SQS': return done(null, sqsProvider);
    case 'REDIS':
    case 'BULL':
      return done(null, bullProvider);
    case 'LOCAL': return done(null, localProvider);
    default: return done(new Error(`${queueProvider} is not a valid queue provider`));
  }
};

export const getPrefixedQueueName = queueName => `${process.env.QUEUE_NAMESPACE}_${queueName}`;

export const publish = ({ queueName, payload, deadLetter, opts }, done = defaultCallback) =>
  new Promise((resolve, reject) => {
    getProvider({}, (err, provider) => {
      if (err) return reject(err);
      const prefixedQueueName = getPrefixedQueueName(queueName);
      provider.publish({ queueName: prefixedQueueName, payload, deadLetter, opts }, (err, queue) => {
        if (err) return reject(err);
        resolve(queue);
      });
    });
  })
  .then(queue => done(null, queue))
  .catch(err => done(err));

export const subscribe = ({
  queueName,
  handler,
  onProccessed,
  deadLetter,
  retryDelay,
}, done = defaultCallback) =>
  new Promise((resolve, reject) => {
    getProvider({}, (err, provider) => {
      if (err) return reject(err);
      const prefixedQueueName = getPrefixedQueueName(queueName);
      provider.subscribe({
        queueName: prefixedQueueName,
        handler,
        onProccessed,
        deadLetter,
        retryDelay
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
