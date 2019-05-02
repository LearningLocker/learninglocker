import { XAPI_STATEMENTS_DELETE } from 'lib/constants/scopes';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import testId from 'api/routes/tests/utils/testId';
import BatchDelete from 'lib/models/batchDelete';
import { STATEMENT_BATCH_DELETE_TERMINATE_ROOT } from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createClient from 'api/routes/tests/utils/models/createClient';

const otherTestId = '561a679c0c5d017e4004714e';

describe('BatchDeleteController terminate', () => {
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
    await apiApp.post(`${STATEMENT_BATCH_DELETE_TERMINATE_ROOT}/${testId}`)
      .set('Authorization', `Bearer ${orgToken}`)
      .send({
        filter: {
          foo: 'bar'
        }
      })
      .expect(403);
  });

  it('should reject a termination that doesnt exist', async () => {
    const basicClient = await createClient([XAPI_STATEMENTS_DELETE]);
    await apiApp.post(`${STATEMENT_BATCH_DELETE_TERMINATE_ROOT}/${otherTestId}`)
    .auth(basicClient.api.basic_key, basicClient.api.basic_secret)
      .send()
      .expect(404);

    const batchDelete = await BatchDelete.findById(testId);
    expect(batchDelete.done).to.equal(false);
  });

  it('should reject a termination that doesnt exist in my org', async () => {
    const otherOrgBatchDelete = new BatchDelete({
      _id: otherTestId,
      organisation: otherTestId,
      client: otherTestId,
      filter: '{"foo":"bar"}',
      done: false,
      processing: false,
      pageSize: 1000
    });
    await otherOrgBatchDelete.save();
    const basicClient = await createClient([XAPI_STATEMENTS_DELETE]);
    await apiApp.post(`${STATEMENT_BATCH_DELETE_TERMINATE_ROOT}/${otherTestId}`)
    .auth(basicClient.api.basic_key, basicClient.api.basic_secret)
      .send()
      .expect(404);

    const batchDelete = await BatchDelete.findById(testId);
    expect(batchDelete.done).to.equal(false);
  });

  it('should terminate a batch deletion', async () => {
    const basicClient = await createClient([XAPI_STATEMENTS_DELETE]);
    await apiApp.post(`${STATEMENT_BATCH_DELETE_TERMINATE_ROOT}/${testId}`)
      .auth(basicClient.api.basic_key, basicClient.api.basic_secret)
      .send()
      .expect(204);

    const batchDelete = await BatchDelete.findById(testId);
    expect(batchDelete.done).to.equal(true);
  });
});
