

import { XAPI_STATEMENTS_DELETE } from 'lib/constants/scopes';
import { expect } from 'chai';
import setup from 'api/routes/tests/utils/setup';
import { STATEMENT_BATCH_DELETE_INITIALISE } from 'lib/constants/routes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createClient from 'api/routes/tests/utils/models/createClient';

describe('BatchDeleteController terminate', () => {
  const apiApp = setup();
  
  it('should reject a token without the deletion scope', async () => {
    const orgToken = await createOrgToken();
    await apiApp.post(STATEMENT_BATCH_DELETE_INITIALISE)
      .set('Authorization', `Bearer ${orgToken}`)
      .send({
        filter: {
          foo: "bar"
        }
      })
      .expect(403);
  });

  it.only('should initialise a deletion with the correct filer', async () => {
    const filter = {
      foo: "bar"
    };
    const basicClient = await createClient([XAPI_STATEMENTS_DELETE]);
    const result = await apiApp.post(STATEMENT_BATCH_DELETE_INITIALISE)
      .auth(basicClient.api.basic_key, basicClient.api.basic_secret)
      .send({
        filter: {
          foo: "bar"
        }
      })
      .expect(200);
    expect(result.body.filter).to.deep.equal(JSON.stringify(filter));
    return;
  });
});
