import createDashboard from 'api/routes/tests/utils/models/createDashboard';
import createDashboardToken from 'api/routes/tests/utils/tokens/createDashboardToken';
import setup from 'api/routes/tests/utils/setup';
import { RESTIFY_PREFIX } from 'lib/constants/routes';

describe('API HTTP POST dashboards route scope filtering', () => {
  const apiApp = setup();

  const assertCreate = ({ bearerToken, basicClient, expectedStatus }) => {
    const test = apiApp
      .post(`${RESTIFY_PREFIX}/dashboard`)
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

  it('should fail to create a dashboard using a dashboardToken', async () => {
    const dashboard = await createDashboard({});
    const dashboardToken = await createDashboardToken(dashboard);
    return assertCreate({ bearerToken: dashboardToken, expectedStatus: 403 });
  });
});
