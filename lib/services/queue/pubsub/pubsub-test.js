import { expect } from 'chai';
import { promisify } from 'bluebird';
import { subscribe, publish } from './index';

describe.skip('pubsub queue', () => {
  it('Should queue items', async () => {
    const queueName = 'testQueue';

    let called = false;

    const handler = (item, done) => {
      expect(item.test).to.equal('test');
      called = true;
      done();
    };

    let onProcessed;
    const processedPromise = new Promise((resolve) => {
      onProcessed = () => {
        resolve();
      };
    });

    await promisify(subscribe)({
      queueName,
      handler,
      onProcessed
    });

    await promisify(publish)({
      queueName,
      payload: {
        test: 'test'
      }
    });

    await processedPromise;

    expect(called).to.equal(true);
  }).timeout(10000);

  it('Should deadletter nack message', async () => {
    const queueName = 'testQueue2';

    let called = false;

    const handler = (item, done) => {
      expect(item.test).to.equal('test');
      done('error!!!');
    };

    const deadLetterHandler = (item, done) => {
      called = true;
      expect(item.test).to.equal('test');
      done(null);
    };

    let onProcessed;
    const processedPromise = new Promise((resolve) => {
      onProcessed = () => {
        resolve();
      };
    });

    await promisify(subscribe)({
      queueName,
      handler,
      deadLetter: `${queueName}_DEADLETTER`
    });

    await promisify(subscribe)({
      queueName: `${queueName}_DEADLETTER`,
      handler: deadLetterHandler,
      onProcessed
    });

    await promisify(publish)({
      queueName,
      payload: {
        test: 'test'
      }
    });

    await processedPromise;

    expect(called).to.equal(true);
  }).timeout(10000);
});
