import { expect } from 'chai';
import { subscribe, publish, getQueue } from './index';

describe('Local queue', () => {
  it('Should queue items', () => {
    const queueName = 'testQueue';

    const handler = (item, done) => {
      expect(item.test).to.equal('test');
      done();
    };

    subscribe({ queueName, handler });

    publish({
      queueName,
      payload: {
        test: 'test'
      }
    });

    expect(getQueue(queueName).size).to.equal(0);
  });

  it('Should not remove item if processing item fails', () => {
    const queueName = 'testQueue2';

    const handler = (item, done) => {
      done('there was an error');
    };

    subscribe({ queueName, handler });

    publish({
      queueName,
      payload: {
        test: 'test'
      }
    });

    expect(getQueue(queueName).size).to.equal(1);
  });
});
