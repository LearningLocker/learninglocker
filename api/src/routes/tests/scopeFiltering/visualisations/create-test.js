import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import {
  EDIT_ALL_VISUALISATIONS,
  EDIT_PUBLIC_VISUALISATIONS
} from 'lib/constants/orgScopes';
import createDashboard from 'api/routes/tests/utils/models/createDashboard';
import createDashboardToken from 'api/routes/tests/utils/tokens/createDashboardToken';
import createClient from 'api/routes/tests/utils/models/createClient';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import createOwnerOrgToken
  from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import setup from 'api/routes/tests/utils/setup';
import { RESTIFY_PREFIX } from 'lib/constants/routes';

describe('API HTTP POST visualisations route scope filtering', () => {
  const apiApp = setup();

  const assertCreate = ({ bearerToken, basicClient, expectedStatus }) => {
    const test = apiApp
      .post(`${RESTIFY_PREFIX}/visualisation`)
      .set('Content-Type', 'application/json');

    if (bearerToken) {
      test.set('Authorization', `Bearer ${bearerToken}`);
    } else if (basicClient) {
      test.auth(basicClient.api.basic_key, basicClient.api.basic_secret);
    }
    if (expectedStatus >= 200 && expectedStatus < 300) {
      test.expect('Content-Type', /json/i);
    }
    return test.expect(expectedStatus);
  };

  it('should create inside the org when using all scope', async () => {
    const bearerToken = await createOrgToken([ALL]);
    await assertCreate({ bearerToken, expectedStatus: 201 });
  });

  it('should create inside the org when using no scopes', async () => {
    const bearerToken = await createOrgToken([]);
    await assertCreate({ bearerToken, expectedStatus: 201 });
  });

  it('should create inside the org when using edit all scope', async () => {
    const bearerToken = await createOrgToken([EDIT_ALL_VISUALISATIONS]);
    await assertCreate({ bearerToken, expectedStatus: 201 });
  });

  it('should create inside the org when using edit public scope', async () => {
    const bearerToken = await createOrgToken([EDIT_PUBLIC_VISUALISATIONS]);
    await assertCreate({ bearerToken, expectedStatus: 201 });
  });

  it('should create inside the org when using owner org token', async () => {
    const bearerToken = await createOwnerOrgToken();
    await assertCreate({ bearerToken, expectedStatus: 201 });
  });

  it('should create inside the org when using site admin token', async () => {
    const bearerToken = await createUserToken([SITE_ADMIN]);
    await assertCreate({ bearerToken, expectedStatus: 201 });
  });

  it('should create when client basic has the ALL scope', async () => {
    const basicClient = await createClient([ALL]);
    await assertCreate({ basicClient, expectedStatus: 201 });
  });

  it('should not create when client basic has no scopes', async () => {
    const basicClient = await createClient();
    await assertCreate({ basicClient, expectedStatus: 403 });
  });

  it('should fail to create a visualisation using a dashboardToken', async () => {
    const dashboard = await createDashboard({});
    const dashboardToken = await createDashboardToken(dashboard);
    await assertCreate({ bearerToken: dashboardToken, expectedStatus: 403 });
  });
});
