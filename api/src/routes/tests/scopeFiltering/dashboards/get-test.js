import createDashboard from 'api/routes/tests/utils/models/createDashboard';
import createDashboardToken from 'api/routes/tests/utils/tokens/createDashboardToken';
import setup from 'api/routes/tests/utils/setup';
import assertGetNodes from '../utils/assertGetNodes';
import assertGetNode from '../utils/assertGetNode';

describe('API HTTP GET dashboards route scope filtering', () => {
  const apiApp = setup();
  const assertNodes = assertGetNodes(apiApp, 'dashboard');
  const assertNode = modelId => assertGetNode(apiApp, 'dashboard', modelId);

  it('should only return the dashboard attached to the dashboard token on GET', async () => {
    const dashboard = await createDashboard({});
    await createDashboard({});
    const dashboardToken = await createDashboardToken(dashboard);
    return assertNodes({ bearerToken: dashboardToken }, 1);
  });

  it('should only return the dashboard attached to the dashboard token on GET/:id', async () => {
    const dashboard = await createDashboard({});
    await createDashboard({});
    const dashboardToken = await createDashboardToken(dashboard);
    return assertNode(dashboard._id)({ bearerToken: dashboardToken, expectedStatus: 404 });
  });

  it('should 404 when fetching a dashboard not attached to dashboard token on GET/:id', async () => {
    const dashboard1 = await createDashboard({});
    const dashboard2 = await createDashboard({});
    const dashboardToken = await createDashboardToken(dashboard2);
    return assertNode(dashboard1._id)({ bearerToken: dashboardToken, expectedStatus: 404 });
  });
});
