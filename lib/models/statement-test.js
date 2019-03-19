import { get } from 'lodash';
import { expect } from 'chai';
import moment from 'moment';
import Statement, {
  getAggregationStatus,
  asyncRunAggregation,
  buildRedisKeyPrefix
} from './statement';

describe('statement', () => {
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
  }

  describe('asyncRunAggregation', () => {
    it('should set status and results to redis', async () => {
      const prefix = buildRedisKeyPrefix('ORG_ID', [], 3, 10);
      const mockClient = new MockRedisClient();

      const before = moment();
      await asyncRunAggregation(mockClient, 'ORG_ID', [], 3, 10, 100, 1000, 3000);
      const after = moment();

      const startedAt = await mockClient.get(`${prefix}-STARTED-AT`);
      const completedAt = await mockClient.get(`${prefix}-COMPLETED-AT`);
      const results = await mockClient.get(`${prefix}-RESULTS`);

      expect(moment(startedAt).isSameOrBefore(after)).to.equal(true);
      expect(moment(startedAt).isSameOrAfter(before)).to.equal(true);

      expect(moment(completedAt).isSameOrBefore(after)).to.equal(true);
      expect(moment(completedAt).isSameOrAfter(before)).to.equal(true);

      expect(results).to.not.equal(undefined);
    });
  });

  describe('getAggregationStatus', () => {
    it('should get aggregation status from redis', async () => {
      const prefix = buildRedisKeyPrefix('ORG_ID', { a: 1, b: [] }, 3, 10);
      const mockClient = new MockRedisClient({
        [`${prefix}-STARTED-AT`]: '2020-01-01 01:01:01:000Z',
        [`${prefix}-COMPLETED-AT`]: '2020-02-02 02:02:02:000Z',
        [`${prefix}-RESULTS`]: ['r1', 'r2'],
      });

      const actual = await getAggregationStatus(mockClient, 'ORG_ID', { a: 1, b: [] }, 3, 10);

      expect(actual).to.deep.equal({
        results: ['r1', 'r2'],
        status: {
          startedAt: '2020-01-01 01:01:01:000Z',
          completedAt: '2020-02-02 02:02:02:000Z',
        },
      });
    });
  });
});
