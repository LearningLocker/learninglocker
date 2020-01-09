import { expect } from 'chai';
import { promisify, delay } from 'bluebird';
import { subscribe, publish } from './index';

describe('serviceBus', () => {
  it('should subscribe to queue', async () => {
    let called = false;
    let handler;
    const handledPromise = new Promise((resolve) => {
      handler = (data, done) => {
        called = true;
        expect(data.test).to.equal('data');
        resolve();
        done();
      };
    });

    await promisify(subscribe)({
      queueName: 'test-queue',
      handler
    });

    await promisify(publish)({
      queueName: 'test-queue',
      payload: {
        test: 'data'
      }
    });

    await handledPromise;
    expect(called).to.equal(true);
  }).timeout(5000);

  it('should dead letter on error', async () => {
    let called = false;

    let handler;
    const handledPromise = new Promise((resolve) => {
      handler = (data, done) => {
        called = true;
        expect(data.test).to.equal('data');
        const errMsg = 'An error';
        resolve();
        done(errMsg);
      };
    });

    await promisify(subscribe)({
      queueName: 'test-queue-2',
      handler,
      deadLetter: 'test-queue-2-deadletter'
    });

    await promisify(publish)({
      queueName: 'test-queue-2',
      payload: {
        test: 'data'
      }
    });

    await handledPromise;

    expect(called).to.equal(true);
  });

  it.skip('should review the lock', async () => {
    let called = 0;

    let handler;
    const donePromise = new Promise((resolve) => {
      handler = async (data, done) => {
        called += 1;
        await delay(6 * 60 * 1000);
        resolve();
        done();
      };
    });

    await promisify(subscribe)({
      queueName: 'test-queue-3',
      handler
    });

    await promisify(publish)({
      queueName: 'test-queue-3',
      payload: {
        test: 'data'
      }
    });

    await donePromise;
    expect(called).to.equal(1);
  })/* .timeout(7 * 60 * 1000)*/;
});
