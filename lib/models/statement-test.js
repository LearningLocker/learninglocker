import { get } from 'lodash';
import { expect } from 'chai';
import moment from 'moment';
import Statement, {
  getAggregationStatus,
  runAggregationAsync,
  buildRedisKeyPrefix
} from './statement';

describe('models/statement', () => {
  it('should replace &46 with .', () => {
    const result = Statement.postFetchMap({
      statement: {
        'test&46;com': {
          'test2&46;com': 'test'
        }
      }
    });

    expect(get(result, ['statement', 'test.com', 'test2.com'])).to.equal('test');
  });

  class MockRedisClient {
    constructor(state = {}) {
      this.state = state;
    }

    del(key) {
      return new Promise((resolve) => {
        delete this.state[key];
        resolve();
      });
    }

    get(key) {
      return new Promise((resolve) => {
        resolve(this.state[key]);
      });
    }

    set(key, value) {
      return new Promise((resolve) => {
        this.state[key] = value;
        resolve();
      });
    }

    setex(key, _, value) {
      this.set(key, value);
      // not mimic expiration
    }
  }

  describe('runAggregationAsync', () => {
    it('should set status and results to redis', async () => {
      const prefix = buildRedisKeyPrefix('ORG_ID', [], 3, 10);
      const mockClient = new MockRedisClient();

      const before = moment();
      await runAggregationAsync(mockClient, 'ORG_ID', [], 3, 10);
      const after = moment();

      const completedAt = await mockClient.get(`${prefix}-COMPLETED-AT`);
      const results = await mockClient.get(`${prefix}-RESULTS`);

      expect(moment(completedAt).isSameOrBefore(after)).to.equal(true);
      expect(moment(completedAt).isSameOrAfter(before)).to.equal(true);

      expect(results).to.not.equal(undefined);
    });
  });

  describe('getAggregationStatus', () => {
    it('should get aggregation status from redis', async () => {
      const prefix = buildRedisKeyPrefix('ORG_ID', { a: 1, b: [] }, 3, 10);
      const mockClient = new MockRedisClient({
        [`${prefix}-STARTED-AT`]: '2020-01-01 01:01:01.000+00:00',
        [`${prefix}-COMPLETED-AT`]: '2020-02-02 02:02:02.000+00:00',
        [`${prefix}-RESULTS`]: JSON.stringify(['r1', 'r2']),
      });

      const actual = await getAggregationStatus(mockClient, prefix, null);

      expect(actual).to.deep.equal({
        result: ['r1', 'r2'],
        startedAt: '2020-01-01 01:01:01.000+00:00',
        completedAt: '2020-02-02 02:02:02.000+00:00',
        isRunning: false,
      });
    });

    it('should return result if completedAt is newer than sinceAt', async () => {
      const prefix = buildRedisKeyPrefix('ORG_ID', { a: 1, b: [] }, 3, 10);
      const mockClient = new MockRedisClient({
        [`${prefix}-STARTED-AT`]: '2020-01-01 01:01:01.000+00:00',
        [`${prefix}-COMPLETED-AT`]: '2020-02-02 02:02:02.000+00:00',
        [`${prefix}-RESULTS`]: JSON.stringify(['r1', 'r2']),
      });

      const actual = await getAggregationStatus(mockClient, prefix, '2020-02-02 02:02:01.000+00:00');

      expect(actual).to.deep.equal({
        result: ['r1', 'r2'],
        startedAt: '2020-01-01 01:01:01.000+00:00',
        completedAt: '2020-02-02 02:02:02.000+00:00',
        isRunning: false,
      });
    });

    it('should return null result if completedAt is same or older than sinceAt', async () => {
      const prefix = buildRedisKeyPrefix('ORG_ID', { a: 1, b: [] }, 3, 10);
      const mockClient = new MockRedisClient({
        [`${prefix}-STARTED-AT`]: '2020-01-01 01:01:01.000+00:00',
        [`${prefix}-COMPLETED-AT`]: '2020-02-02 02:02:02.000+00:00',
        [`${prefix}-RESULTS`]: JSON.stringify(['r1', 'r2']),
      });

      const actual = await getAggregationStatus(mockClient, prefix, '2020-02-02 02:02:02.000+00:00');

      expect(actual).to.deep.equal({
        result: null,
        startedAt: '2020-01-01 01:01:01.000+00:00',
        completedAt: null,
        isRunning: false,
      });
    });

    it('should return results if is already running', async () => {
      const expectedStartedAt = '2020-02-02 02:02:02.000+00:00';
      const expectedCompletedAt = '2020-01-01 02:02:02.000+00:00';
      const expectedResults = ['r1', 'r2'];
      const prefix = buildRedisKeyPrefix('ORG_ID', { a: 1, b: [] }, 3, 10);
      const mockClient = new MockRedisClient({
        [`${prefix}-STARTED-AT`]: expectedStartedAt,
        [`${prefix}-COMPLETED-AT`]: expectedCompletedAt,
        [`${prefix}-RESULTS`]: JSON.stringify(expectedResults),
        [`${prefix}-QUERY-RUNNING`]: 1,
      });

      const actual = await getAggregationStatus(mockClient, prefix, null);

      expect(actual).to.deep.equal({
        result: expectedResults,
        startedAt: expectedStartedAt,
        completedAt: expectedCompletedAt,
        isRunning: true,
      });
    });
  });
});
