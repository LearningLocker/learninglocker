import { expect } from 'chai';
import Statement from 'lib/models/statement';
import SiteSettings from 'lib/models/siteSettings';
import testId from 'api/routes/tests/utils/testId';
import async from 'async';
import moment from 'moment';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import BatchDelete from 'lib/models/batchDelete';
import batchStatementDeletion from './batchStatementDeletion';


describe('batchStatementDeletion', () => {
  beforeEach(async (done) => {
    await Statement.create({
      organisation: testId,
      statement: {},
      lrs_id: testId
    });

    await Statement.create({
      organisation: testId,
      statement: {}
    });
    done();
  });

  afterEach((done) => {
    async.forEach(
      [Statement, SiteSettings, BatchDelete],
      (model, doneDeleting) => {
        model.deleteMany({}, doneDeleting);
      },
      done
    );
  });

  it('should delete statements if in the window', async () => {
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

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: '{}',
      total: 2,
      pageSize: 1,
      organisation: testId
    });

    let publishCallCount = 0;
    let doneCallCount = 0;

    // TEST
    await batchStatementDeletion({
      batchDeleteId,
      publish: () => {
        publishCallCount += 1;
      }
    }, () => {
      doneCallCount += 1;
    });

    // EXPECT
    expect(publishCallCount).to.equal(1);
    expect(doneCallCount).to.equal(1);

    const count = await Statement.countDocuments({});
    expect(count).to.equal(1);

    const batchDelete = await BatchDelete.findById(batchDeleteId);
    expect(batchDelete.deleteCount).to.equal(1);
    expect(batchDelete.done).to.equal(false);
  });

  it('should not delete if outside the window', async () => {
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

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: '{}',
      total: 2,
      pageSize: 1,
      organisation: testId
    });

    let publishCallCount = 0;
    let doneCallCount = 0;

    // TEST
    await batchStatementDeletion({
      batchDeleteId,
      publish: () => {
        publishCallCount += 1;
      }
    }, () => {
      doneCallCount += 1;
    });

    // EXPECT
    expect(publishCallCount).to.equal(0);
    expect(doneCallCount).to.equal(1);

    const count = await Statement.countDocuments({});
    expect(count).to.equal(2);
  });

  it('Should delete all documents', async () => {
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

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: '{"dosent": "exist" }',
      total: 2,
      pageSize: 2,
      organisation: testId
    });

    let publishCallCount = 0;
    let doneCallCount = 0;

    // TEST
    await batchStatementDeletion({
      batchDeleteId,
      publish: () => {
        publishCallCount += 1;
      }
    }, () => {
      doneCallCount += 1;
    });

    // EXPECT
    expect(publishCallCount).to.equal(0);
    expect(doneCallCount).to.equal(1);

    const batchDelete = await BatchDelete.findById(batchDeleteId);
    expect(batchDelete.done).to.equal(true);
    expect(batchDelete.processing).to.equal(false);
  });
});
