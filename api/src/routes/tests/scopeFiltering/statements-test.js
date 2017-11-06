import { ALL } from 'lib/constants/scopes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createFilteredOrgToken
  from 'api/routes/tests/utils/tokens/createFilteredOrgToken';
import setup from 'api/routes/tests/utils/setup';
import createStatement from './utils/createStatement';
import assertGetNodes from './utils/assertGetNodes';

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

describe('API HTTP statements route scope filtering', () => {
  const apiApp = setup();
  const assertNodes = assertGetNodes(apiApp, 'statement');

  it('should return statements inside the org when using org token', async () => {
    const token = await createOrgToken([ALL]);
    await createStatement();
    return assertNodes({ bearerToken: token }, 1);
  });

  it('should not return statements outside the org when using org token', async () => {
    const token = await createOrgToken([ALL]);
    await createStatement({}, '561a679c0c5d017e4004714a');
    return assertNodes({ bearerToken: token }, 0);
  });

  it('should return statements inside the filter when using org token', async () => {
    const scopes = [ALL];
    const orgFilter = createFilter({ $eq: TEST_MBOX });
    const token = await createFilteredOrgToken(scopes, orgFilter);
    await createStatement(createContextTeam(TEST_MBOX));
    return assertNodes({ bearerToken: token }, 1);
  });

  it('should not return statements outside the filter when using org token', async () => {
    const scopes = [ALL];
    const orgFilter = createFilter({ $ne: TEST_MBOX });
    const token = await createFilteredOrgToken(scopes, orgFilter);
    await createStatement(createContextTeam(TEST_MBOX));
    return assertNodes({ bearerToken: token }, 0);
  });
});
