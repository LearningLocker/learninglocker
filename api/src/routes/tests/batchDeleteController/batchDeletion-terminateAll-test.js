import { XAPI_STATEMENTS_DELETE } from 'lib/constants/scopes';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import testId from 'api/routes/tests/utils/testId';
import BatchDelete from 'lib/models/batchDelete';
import { STATEMENT_BATCH_DELETE_TERMINATE_ALL } from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createClient from 'api/routes/tests/utils/models/createClient';

const otherTestId = '561a679c0c5d017e4004714e';

describe('BatchDeleteController all terminate', () => {
  const apiApp = setup();

  beforeEach('Create batchDelete', async () => {
    const batchDelete = new BatchDelete({
      _id: testId,
      organisation: testId,
      client: testId,
      filter: '{"foo":"bar"}',
      done: false,
      processing: false,
      pageSize: 1000
    });
    await batchDelete.save();
  });

  it('should reject a token without the deletion scope', async () => {
    const orgToken = await createOrgToken();
    await apiApp.post(STATEMENT_BATCH_DELETE_TERMINATE_ALL)
      .set('Authorization', `Bearer ${orgToken}`)
      .send({
        filter: {
          foo: 'bar'
        }
      })
      .expect(403);
  });

  it('should terminate all batch deletions in the clients org', async () => {
    const secondBatchDelete = new BatchDelete({
      organisation: testId,
      client: testId,
      filter: '{"foo":"bar"}',
      done: false,
      processing: false,
      pageSize: 1000
    });
    await secondBatchDelete.save();

    const otherOrgBatchDelete = new BatchDelete({
      organisation: otherTestId,
      client: otherTestId,
      filter: '{"foo":"bar"}',
      done: false,
      processing: false,
      pageSize: 1000
    });
    await otherOrgBatchDelete.save();

    const basicClient = await createClient([XAPI_STATEMENTS_DELETE]);
    await apiApp.post(STATEMENT_BATCH_DELETE_TERMINATE_ALL)
      .auth(basicClient.api.basic_key, basicClient.api.basic_secret)
      .send()
      .expect(204);

    const batchDeleteOne = await BatchDelete.findById(testId);
    const batchDeleteTwo = await BatchDelete.findById(secondBatchDelete._id);
    const batchDeleteOtherOrg = await BatchDelete.findById(otherOrgBatchDelete._id);

    expect(batchDeleteOne.done).to.equal(true);
    expect(batchDeleteTwo.done).to.equal(true);
    expect(batchDeleteOtherOrg.done).to.equal(false);
  });
});
