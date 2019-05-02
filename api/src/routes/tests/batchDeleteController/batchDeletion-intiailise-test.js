import { XAPI_STATEMENTS_DELETE } from 'lib/constants/scopes';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import BatchDelete from 'lib/models/batchDelete';
import { STATEMENT_BATCH_DELETE_INITIALISE } from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createClient from 'api/routes/tests/utils/models/createClient';

describe('BatchDeleteController intialise', () => {
  const apiApp = setup();

  it('should reject a token without the deletion scope', async () => {
    const orgToken = await createOrgToken();
    await apiApp.post(STATEMENT_BATCH_DELETE_INITIALISE)
      .set('Authorization', `Bearer ${orgToken}`)
      .send({
        filter: {
          foo: 'bar'
        }
      })
      .expect(403);
  });

  it('should initialise a deletion with the correct filer', async () => {
    const filter = {
      foo: 'bar'
    };
    const basicClient = await createClient([XAPI_STATEMENTS_DELETE]);
    const result = await apiApp.post(STATEMENT_BATCH_DELETE_INITIALISE)
      .auth(basicClient.api.basic_key, basicClient.api.basic_secret)
      .send({
        filter
      })
      .expect(200);
    expect(result.body.filter).to.deep.equal(JSON.stringify(filter));

    const batchDelete = await BatchDelete.findById(result.body._id);
    expect(batchDelete.filter).to.equal(JSON.stringify(filter));
  });

  it('should reject a deletion with no filer', async () => {
    const basicClient = await createClient([XAPI_STATEMENTS_DELETE]);
    await apiApp.post(STATEMENT_BATCH_DELETE_INITIALISE)
      .auth(basicClient.api.basic_key, basicClient.api.basic_secret)
      .send()
      .expect(400);
  });

  it('should reject a deletion with empty filer', async () => {
    const basicClient = await createClient([XAPI_STATEMENTS_DELETE]);
    await apiApp.post(STATEMENT_BATCH_DELETE_INITIALISE)
      .auth(basicClient.api.basic_key, basicClient.api.basic_secret)
      .send({
        filter: {}
      })
      .expect(400);
  });
});
