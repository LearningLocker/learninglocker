import { expect } from 'chai';
import mongoose from 'mongoose';
import QueryCacheValue from 'lib/models/querybuildercachevalue';
import Organisation from 'lib/models/organisation';
import testId from 'api/routes/tests/utils/testId';
import async from 'async';
import moment from 'moment';
import { HIDE, SHOW } from 'lib/constants/recommendation';
import recommendationReset from './recommendationReset';

const objectId = mongoose.Types.ObjectId;

describe('recommendationReset', () => {
  beforeEach(async (done) => {
    await Organisation.create({
      _id: objectId(testId),
      settings: {
        RECOMMENDATION_WINDOW_SIZE: (60 * 60 * 24 * 8) + (60 * 60 * 2)
      }
    });
    done();
  });

  afterEach((done) => {
    async.forEach([QueryCacheValue, Organisation], (model, doneDeleting) => {
      model.deleteMany({}, doneDeleting);
    }, done);
  });

  it('should reset queryCacheValues after window', async () => {
    const toKeepId = (await QueryCacheValue.collection.insertOne({
      organisation: objectId(testId),
      path: 'test1',
      hash: 'test1',
      recommendationWindowCount: 7,
      recommendationWindowStart: moment('31-10-1986', 'DD-MM-YYYY').toDate(),
      recommendationStatus: HIDE,
      updatedAt: moment().subtract(8, 'days').subtract(1, 'hours').toDate()
    })).ops[0]._id;

    const toResetId = (await QueryCacheValue.collection.insertOne({
      organisation: objectId(testId),
      path: 'test2',
      hash: 'test2',
      recommendationWindowCount: 6,
      recommendationWindowStart: moment('31-10-1986', 'DD-MM-YYYY').toDate(),
      recommendationStatus: HIDE,
      updatedAt: moment().subtract(8, 'days').subtract(3, 'hours').toDate()
    })).ops[0]._id;

    await recommendationReset({
      organisationId: testId
    });

    const newToKeep = await QueryCacheValue.findById(toKeepId);
    const newToReset = await QueryCacheValue.findById(toResetId);

    expect(newToKeep.recommendationWindowCount).to.equal(7);
    expect(newToKeep.recommendationStatus).to.equal(HIDE);

    expect(newToReset.recommendationWindowCount).to.equal(0);
    expect(newToReset.recommendationStatus).to.equal(SHOW);
    expect(moment(newToReset.recommendationWindowStart).format('DD-MM-YYYY')).to.equal(moment().format('DD-MM-YYYY'));
  });
});
