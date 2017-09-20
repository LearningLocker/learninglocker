import * as assert from 'assert';
import * as routes from 'lib/constants/routes';
import { ALL } from 'lib/constants/scopes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createFilteredOrgToken
  from 'api/routes/tests/utils/tokens/createFilteredOrgToken';
import setup from 'api/routes/tests/utils/setup';
import testId from 'api/routes/tests/utils/testId';
import createStatement from './utils/createStatement';
import createStore from './utils/createStore';

const TEST_MBOX = 'mailto:team@example.com';

const createContextTeam = mbox => ({
  context: {
    team: {
      objectType: 'Agent',
      mbox
    }
  }
});

const createFilter = mbox => ({
  'statement.context.team.mbox': mbox
});

describe('StatementController.count scope filtering', () => {
  const apiApp = setup();

  const assertCount = async ({ token, expectedCount }) =>
    new Promise((resolve, reject) => {
      apiApp
        .get(routes.STATEMENTS_COUNT)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /json/i)
        .expect((res) => {
          assert.equal(res.body.count, expectedCount, res.body);
        })
        .end((err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
    });

  it('should return statements inside the org when using org token', async () => {
    const token = await createOrgToken([ALL]);
    await createStore(testId, {
      statementCount: 1
    });
    const expectedCount = 1;
    await createStatement();
    return assertCount({ token, expectedCount });
  });

  it('should not return statements outside the org when using org token', async () => {
    const token = await createOrgToken([ALL]);
    const expectedCount = 0;
    await createStatement({}, '561a679c0c5d017e4004714a');
    return assertCount({ token, expectedCount });
  });

  it('should return statements inside the filter when using org token', async () => {
    const scopes = [ALL];
    const orgFilter = createFilter({ $eq: TEST_MBOX });
    const token = await createFilteredOrgToken(scopes, orgFilter);
    const expectedCount = 1;
    await createStatement(createContextTeam(TEST_MBOX));
    return assertCount({ token, expectedCount });
  });

  it('should not return statements outside the filter when using org token', async () => {
    const scopes = [ALL];
    const orgFilter = createFilter({ $ne: TEST_MBOX });
    const token = await createFilteredOrgToken(scopes, orgFilter);
    const expectedCount = 0;
    await createStatement(createContextTeam(TEST_MBOX));
    return assertCount({ token, expectedCount });
  });
});
