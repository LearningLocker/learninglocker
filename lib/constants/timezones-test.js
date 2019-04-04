import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Statement from 'lib/models/statement';
import { timezones } from './timezones';

chai.use(chaiAsPromised);

describe('constants/timezones', () => {
  const buildPipeline = tz => ([
    {
      $project: {
        group: { $hour: { date: '$timestamp', timezone: tz } }
      }
    },
    {
      $group: {
        _id: '$group',
        count: { $sum: 1 },
        group: { $first: '$group' }
      }
    },
    { $limit: 1 }
  ]);

  it('should be used in mongodb queries', async () => {
    for (const tz of timezones) {
      const pipeline = buildPipeline(tz[0]);
      await Statement.aggregate(pipeline);
    }
  });

  it('should not be used in mongodb queries', async () => {
    const pipeline = buildPipeline('INVALID/TIMEZONE');
    try {
      await Statement.aggregate(pipeline);
      expect.fail('should throw error');
    } catch (err) {
      // expected
    }
  });
});
