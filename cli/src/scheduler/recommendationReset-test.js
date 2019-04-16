import { expect } from 'chai';
import Organisation from 'lib/models/organisation';
import testId from 'api/routes/tests/utils/testId';
import async from 'async';
import moment from 'moment';
import runRecommendationReset from './recommendationReset';

describe('recommendationReset', () => {
  beforeEach(async (done) => {
    await Organisation.create({
      _id: testId
    });
    done();
  });

  afterEach((done) => {
    async.forEach([Organisation], (model, doneDeleting) => {
      model.deleteMany({}, doneDeleting);
    }, done);
  });

  it('should schedule for the 2am from 3am', async () => {
    const now = moment('03:00:00', 'HH:mm:ss');

    let timeoutCalled = false;
    const timeout = (_, timeoutMs) => {
      expect(timeoutMs).to.equal(1000 * 60 * 60 * 23);
      timeoutCalled = true;
    };

    let publishCalled = false;
    const publish = (value) => {
      expect(value.payload.organisationId).to.equal(testId);
      publishCalled = true;
    };

    await runRecommendationReset({
      timeout,
      now,
      publish,
      lockTimoutSec: false
    });

    expect(timeoutCalled).to.equal(true);
    expect(publishCalled).to.equal(true);
  });

  it('should schedule for the 2am from 1am', async () => {
    const now = moment('01:00:00', 'HH:mm:ss');

    let timeoutCalled = false;
    const timeout = (_, timeoutMs) => {
      expect(timeoutMs).to.equal(1000 * 60 * 60 * 1);
      timeoutCalled = true;
    };

    let publishCalled = false;
    const publish = (value) => {
      expect(value.payload.organisationId).to.equal(testId);
      publishCalled = true;
    };

    await runRecommendationReset({
      timeout,
      now,
      publish,
      lockTimoutSec: false
    });

    expect(timeoutCalled).to.equal(true);
    expect(publishCalled).to.equal(true);
  });
});
