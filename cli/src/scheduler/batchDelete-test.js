import { expect } from 'chai';
import SiteSettings from 'lib/models/siteSettings';
import BatchDelete from 'lib/models/batchDelete';
import testId from 'api/routes/tests/utils/testId';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import async from 'async';
import moment from 'moment';
import batchDelete from './batchDelete';

describe('batchDelete', () => {
  let batchDeleteId;
  beforeEach(async (done) => {
    const batchDeleteModel = await BatchDelete.create({
      filter: '{}',
      total: 2,
      pageSize: 1,
      organisation: testId
    });
    batchDeleteId = batchDeleteModel._id;
    done();
  });

  afterEach((done) => {
    async.forEach(
      [SiteSettings, BatchDelete],
      (model, doneDeleting) => {
        model.deleteMany({}, doneDeleting);
      },
      done
    );
  });

  it('should schedule the next run and add to queue if the time is in window', async () => {
    const thirtyMinsAgo = moment().subtract(30, 'minutes').set('seconds', 0);
    const thirtyMinsAgoDate = thirtyMinsAgo.toDate();
    const expectedNextRunTime = thirtyMinsAgo.add(1, 'day');
    await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_ID,
      {
        batchDeleteWindowUTCHour: thirtyMinsAgoDate.getUTCHours(),
        batchDeleteWindowUTCMinutes: thirtyMinsAgoDate.getUTCMinutes(),
        batchDeleteWindowDurationSeconds: 60 * 60 // An hour
      }, {
        upsert: true,
        new: true
      }
    );

    let publishCount = 0;
    const nextRunTimeout = await batchDelete({
      publish: ({
        payload: {
          batchDeleteId: batchDeleteIdResult
        }
      }) => {
        expect(batchDeleteIdResult).to.equal(batchDeleteId.toString());
        publishCount += 1;
      },
      batchStatementDeletionLockTimoutSec: false
    });

    const nextRunTime = moment().add(nextRunTimeout, 'milliseconds');

    expect(publishCount).to.equal(1);
    expect(nextRunTime.isSame(expectedNextRunTime, 'minute')).to.equal(true);
  });

  it('should schedule the next for the future and not publish any jobs', async () => {
    const thirtyMinsInFuture = moment().add(30, 'minutes').set('seconds', 0);
    const thirtyMinsInFutureDate = thirtyMinsInFuture.toDate();
    const expectedNextRunTime = thirtyMinsInFuture;
    const durationSeconds = 60 * 60;
    await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_ID,
      {
        batchDeleteWindowUTCHour: thirtyMinsInFutureDate.getUTCHours(),
        batchDeleteWindowUTCMinutes: thirtyMinsInFutureDate.getUTCMinutes(),
        batchDeleteWindowDurationSeconds: durationSeconds // An hour
      }, {
        upsert: true,
        new: true
      }
    );

    let publishCount = 0;
    const nextRunTimeout = await batchDelete({
      publish: ({
        payload: {
          batchDeleteId: batchDeleteIdResult
        }
      }) => {
        expect(batchDeleteIdResult).to.equal(batchDeleteId.toString());
        publishCount += 1;
      },
      batchStatementDeletionLockTimoutSec: false
    });
    const nextRunTime = moment().add(nextRunTimeout, 'milliseconds');

    expect(publishCount).to.equal(0);
    expect(nextRunTime.isSame(expectedNextRunTime, 'minute')).to.equal(true);
  });
});
