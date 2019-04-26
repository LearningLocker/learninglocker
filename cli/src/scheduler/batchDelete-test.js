import { expect } from 'chai';
import SiteSettings from 'lib/models/siteSettings';
import BatchDelete from 'lib/models/batchDelete';
import testId from 'api/routes/tests/utils/testId';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import async from 'async';
import moment from 'moment';
import batchDelete from './batchDelete';

describe.only('batchDelete', () => {
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

  it('should schedule the next run and add to queue if the time is in the past', async () => {
    await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_ID,
      {
        batchDeleteWindowStartTime: (moment().subtract(30, 'minutes')).toDate(),
        batchDeleteWindowDuration: 1000 * 60 * 60 // An hour
      }, {
        upsert: true,
        new: true
      }
    );

    let publishCount = 0;
    let nextRunTimeout;
    await batchDelete({
      publish: ({
        payload: {
          batchDeleteId: batchDeleteIdResult
        }
      }) => {
        expect(batchDeleteIdResult).to.equal(batchDeleteId.toString());
        publishCount += 1;
      },
      timeout: (timeoutFn, timeout) => {
        nextRunTimeout = timeout;
      },
      batchStatementDeletionLockTimoutSec: false
    });

    expect(publishCount).to.equal(1);
    expect(nextRunTimeout).to.equal(
      1000 * 60 * 60 * 23.5
    );
  });

  it('should schedule the next run and add to queue if the time is in the future', async () => {
    await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_ID,
      {
        batchDeleteWindowStartTime: (moment().add(30, 'minutes')).toDate(),
        batchDeleteWindowDuration: 1000 * 60 * 60 // An hour
      }, {
        upsert: true,
        new: true
      }
    );

    let publishCount = 0;
    let nextRunTimeout;
    await batchDelete({
      publish: ({
        payload: {
          batchDeleteId: batchDeleteIdResult
        }
      }) => {
        expect(batchDeleteIdResult).to.equal(batchDeleteId.toString());
        publishCount += 1;
      },
      timeout: (timeoutFn, timeout) => {
        nextRunTimeout = timeout;
      },
      batchStatementDeletionLockTimoutSec: false
    });

    expect(publishCount).to.equal(1);
    expect(nextRunTimeout).to.equal(
      1000 * 60 * 30
    );
  });
});
