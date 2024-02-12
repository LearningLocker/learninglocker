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
import { XAPI_STATEMENTS_DELETE } from 'lib/constants/scopes';
import batchStatementDeletion from './batchStatementDeletion';

const objectId = mongoose.Types.ObjectId;

describe('batchStatementDeletion', () => {
  const testClientId = '561a679c0c5d017e4004715f';
  const testClientIdNoLRS = '561a679c0c5d017e4004718f';
  const testStoreId = '561a679c0c5d017e4004716f';
  const statementData = { field: 'exists' };
  const validFilter = '{"statement.field": "exists"}';

  beforeEach(async () => {
    process.env.ENABLE_STATEMENT_DELETION = true;

    await Statement.create({
      organisation: testId,
      statement: statementData,
      hash: uuid.v4(),
      lrs_id: testStoreId
    });

    await Statement.create({
      organisation: testId,
      statement: statementData,
      lrs_id: testStoreId,
      hash: uuid.v4()
    });

    await Client.create({
      _id: objectId(testClientId),
      organisation: testId,
      lrs_id: objectId(testStoreId),
      scopes: [XAPI_STATEMENTS_DELETE]
    });

    await Client.create({
      _id: objectId(testClientIdNoLRS),
      organisation: testId,
      scopes: [XAPI_STATEMENTS_DELETE]
    });
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
    const now = new Date();
    await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_ID,
      {
        batchDeleteWindowUTCHour: now.getUTCHours(),
        batchDeleteWindowUTCMinutes: now.getUTCMinutes(),
        batchDeleteWindowDurationSeconds: 60 * 60 // An hour
      }, {
        upsert: true,
        new: true
      }
    );

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: validFilter,
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
    const thirtyMinsInFutureDate = moment().add(30, 'minutes').toDate();
    await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_ID,
      {
        batchDeleteWindowUTCHour: thirtyMinsInFutureDate.getUTCHours(),
        batchDeleteWindowUTCMinutes: thirtyMinsInFutureDate.getUTCMinutes(),
        batchDeleteWindowDurationSeconds: 60 * 60 // An hour
      }, {
        upsert: true,
        new: true
      }
    );

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: validFilter,
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

  it('Should delete all documents when in window', async () => {
    const thirtyMinsAgoDate = moment().subtract(30, 'minutes').toDate();
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

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: validFilter,
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
    expect(publishCallCount).to.equal(1);
    expect(doneCallCount).to.equal(1);

    const batchDelete = await BatchDelete.findById(batchDeleteId);
    expect(batchDelete.done).to.equal(false);
    expect(batchDelete.processing).to.equal(false);

    const count = await Statement.find({ organisation: testId, filter: '{"dosent": "exist" }' }).count().exec();
    expect(count).to.equal(0);
  });

  it('Should delete all documents when no window', async () => {
    await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_ID,
      {
        batchDeleteWindowUTCHour: null
      }, {
        upsert: true,
        new: true
      }
    );

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: validFilter,
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
    expect(publishCallCount).to.equal(1);
    expect(doneCallCount).to.equal(1);

    const batchDelete = await BatchDelete.findById(batchDeleteId);
    expect(batchDelete.done).to.equal(false);
    expect(batchDelete.processing).to.equal(false);

    const count = await Statement.find({ organisation: testId, filter: '{"dosent": "exist" }' }).count().exec();
    expect(count).to.equal(0);
  });

  it('Should mark as done when no matching data', async () => {
    await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_ID,
      {
        batchDeleteWindowUTCHour: null
      }, {
        upsert: true,
        new: true
      }
    );

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: '{"foo": "bar does not exist"}',
      total: 0,
      pageSize: 0,
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

  it('Should mark as done on invalid filter', async () => {
    await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_ID,
      {
        batchDeleteWindowUTCHour: null
      }, {
        upsert: true,
        new: true
      }
    );

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: '{"""invalidfilter""""}',
      total: 0,
      pageSize: 0,
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

  it('Should mark as done on empty filter', async () => {
    await SiteSettings.findByIdAndUpdate(
      SITE_SETTINGS_ID,
      {
        batchDeleteWindowUTCHour: null
      }, {
        upsert: true,
        new: true
      }
    );

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: '{}',
      total: 0,
      pageSize: 0,
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
      filter: validFilter,
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
      lrs_id: '561a679c0c5d017e4004717f' // different lrs to the clients
    });

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: validFilter,
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

    // all statements should be there;
    const result = await Statement.find({});
    expect(result.length).to.equal(1);

    const batchDelete = await BatchDelete.findById(batchDeleteId);
    expect(batchDelete.done).to.equal(false);
    expect(batchDelete.processing).to.equal(false);
  });

  it('should delete all statements (in the org)', async () => {
    await Statement.create({
      organisation: testId,
      statement: statementData,
      hash: uuid.v4(),
      lrs_id: '561a679c0c5d017e4004717f'
    });

    await Statement.create({
      organisation: '561a679c0c5d017e4004718f',
      statement: {},
      hash: uuid.v4(),
      lrs_id: '561a679c0c5d017e4004717f'
    });

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: validFilter,
      total: 3,
      pageSize: 4,
      organisation: testId,
      client: testClientIdNoLRS
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
    expect(batchDelete.processing).to.equal(false);
  });

  it('should delete no statements (in the org)', async () => {
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

    await Client.findByIdAndUpdate(testClientIdNoLRS, {
      scopes: []
    });

    const { _id: batchDeleteId } = await BatchDelete.create({
      filter: '{}',
      total: 3,
      pageSize: 4,
      organisation: testId,
      client: testClientIdNoLRS
    });

    // Test
    await batchStatementDeletion({
      batchDeleteId,
      publish: () => {}
    }, () => {});

    // all statemenst should be there;
    const result = await Statement.count({ organisation: testId });
    expect(result).to.equal(3);

    const batchDelete = await BatchDelete.findById(batchDeleteId);
    expect(batchDelete.done).to.equal(true);
    expect(batchDelete.processing).to.equal(false);
  });
});

