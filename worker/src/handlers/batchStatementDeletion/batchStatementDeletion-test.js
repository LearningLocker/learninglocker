import mongoose from 'mongoose';
import { expect } from 'chai';
import Statement from 'lib/models/statement';
import SiteSettings from 'lib/models/siteSettings';
import testId from 'api/routes/tests/utils/testId';
import async from 'async';
import moment from 'moment';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import BatchDelete from 'lib/models/batchDelete';
import Client from 'lib/models/client';
import uuid from 'uuid';
import { XAPI_STATEMENTS_DELETE, ALL } from 'lib/constants/scopes';
import batchStatementDeletion from './batchStatementDeletion';

const objectId = mongoose.Types.ObjectId;

describe('batchStatementDeletion', () => {
  const testClientId = '561a679c0c5d017e4004715f';
  const testStoreId = '561a679c0c5d017e4004716f';

  beforeEach(async (done) => {
    await Statement.create({
      organisation: testId,
      statement: {},
      hash: uuid.v4(),
      lrs_id: testStoreId
    });

    await Statement.create({
      organisation: testId,
      statement: {},
      lrs_id: testStoreId,
      hash: uuid.v4()
    });

    await Client.create({
      _id: objectId(testClientId),
      organisation: testId,
      lrs_id: objectId(testStoreId),
      scopes: [XAPI_STATEMENTS_DELETE]
    });

    done();
  });

  afterEach((done) => {
    async.forEach(
      [Statement, SiteSettings, BatchDelete, Client],
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
      organisation: testId,
      client: testClientId
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
      organisation: testId,
      client: testClientId
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

  it('should do nothing if client does not exist', async () => {
    await Client.deleteOne({ _id: testClientId });

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: '{}',
      total: 0,
      pageSize: 3,
      organisation: testId,
      client: testClientId
    });

    // Test
    await batchStatementDeletion({
      batchDeleteId,
      publish: () => {}
    }, () => {});

    // all statemenst should be there;
    const result = await Statement.find({});
    expect(result.length).to.equal(2);

    const batchDelete = await BatchDelete.findById(batchDeleteId);
    expect(batchDelete.done).to.equal(true);
    expect(batchDelete.processing).to.equal(false);
  });

  it('should only delete statements in my store', async () => {
    await Statement.create({
      organisation: testId,
      statement: {},
      hash: uuid.v4(),
      lrs_id: '561a679c0c5d017e4004717f'
    });

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: '{}',
      total: 2,
      pageSize: 3,
      organisation: testId,
      client: testClientId
    });

    // Test
    await batchStatementDeletion({
      batchDeleteId,
      publish: () => {}
    }, () => {});

    // all statemenst should be there;
    const result = await Statement.find({});
    expect(result.length).to.equal(1);

    const batchDelete = await BatchDelete.findById(batchDeleteId);
    expect(batchDelete.done).to.equal(false);
    expect(batchDelete.processing).to.equal(false);
  });

  it('should delete all statements (in the org)', async () => {
    await Statement.create({
      organisation: testId,
      statement: {},
      hash: uuid.v4(),
      lrs_id: '561a679c0c5d017e4004717f'
    });

    await Statement.create({
      organisation: '561a679c0c5d017e4004718f',
      statement: {},
      hash: uuid.v4(),
      lrs_id: '561a679c0c5d017e4004717f'
    });

    await Client.findByIdAndUpdate(testClientId, {
      scopes: [XAPI_STATEMENTS_DELETE, ALL]
    });

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: '{}',
      total: 3,
      pageSize: 4,
      organisation: testId,
      client: testClientId
    });

    // Test
    await batchStatementDeletion({
      batchDeleteId,
      publish: () => {}
    }, () => {});

    // all statemenst should be there;
    const result = await Statement.find({});
    expect(result.length).to.equal(1);

    const batchDelete = await BatchDelete.findById(batchDeleteId);
    expect(batchDelete.done).to.equal(false);
    expect(batchDelete.processing).to.equal(false);
  });
});
