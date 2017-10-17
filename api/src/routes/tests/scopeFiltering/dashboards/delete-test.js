import createDashboard from 'api/routes/tests/utils/models/createDashboard';
import createDashboardToken from 'api/routes/tests/utils/tokens/createDashboardToken';
import setup from 'api/routes/tests/utils/setup';
import { RESTIFY_PREFIX } from 'lib/constants/routes';

describe('API HTTP DELETE visualisations route scope filtering', () => {
  const apiApp = setup();

  const assertDelete = async({
    bearerToken,
    basicClient,
    expectedStatus = 204
  }) => {
    const dashboard = await createDashboard();

    const test = apiApp
      .delete(`${RESTIFY_PREFIX}/visualisation/${dashboard._id.toString()}`)
      .set('Content-Type', 'application/json');

    if (bearerToken) {
      test.set('Authorization', `Bearer ${bearerToken}`);
    } else if (basicClient) {
      test.auth(basicClient.api.basic_key, basicClient.api.basic_secret);
    }

    return test.expect(expectedStatus);
  };

  it('should fail to delete a dashboard using a dashboardToken', async () => {
    const dashboard = await createDashboard({});
    const dashboardToken = await createDashboardToken(dashboard);
    await assertDelete({ bearerToken: dashboardToken, expectedStatus: 403 });
  });
});
