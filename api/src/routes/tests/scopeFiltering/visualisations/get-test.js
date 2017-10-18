import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import {
  VIEW_PUBLIC_VISUALISATIONS,
  VIEW_ALL_VISUALISATIONS
} from 'lib/constants/orgScopes';
import createClient from 'api/routes/tests/utils/models/createClient';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import createDashboardToken from 'api/routes/tests/utils/tokens/createDashboardToken';
import setup from 'api/routes/tests/utils/setup';
import createVisualisation from '../utils/createVisualisation';
import assertGetNodes from '../utils/assertGetNodes';

const TEST_USER_ID = '561a679c0c5d017e4004714e';

describe('API HTTP GET visualisations route scope filtering', () => {
  const apiApp = setup();
  const assertNodes = assertGetNodes(apiApp, 'visualisation');

  const createVisualisations = () =>
    Promise.all([
      createVisualisation(false),
      createVisualisation(true, TEST_USER_ID),
      createVisualisation(false, TEST_USER_ID)
    ]);

  it('should return all visualisations inside the org when using all scope', async () => {
    const bearerToken = await createOrgToken([ALL]);
    await createVisualisations(bearerToken);
    return assertNodes({ bearerToken }, 3);
  });

  it('should return own visualisations inside the org when using no scopes', async () => {
    const bearerToken = await createOrgToken([]);
    await createVisualisations();
    return assertNodes({ bearerToken }, 1);
  });

  it('should return all visualisations inside the org when using view all scope', async () => {
    const bearerToken = await createOrgToken([VIEW_ALL_VISUALISATIONS]);
    await createVisualisations();
    return assertNodes({ bearerToken }, 3);
  });

  it('should return public visualisations inside the org when using view public scope', async () => {
    const bearerToken = await createOrgToken([VIEW_PUBLIC_VISUALISATIONS]);
    await createVisualisations();
    return assertNodes({ bearerToken }, 2);
  });

  it('should return all visualisations inside the org when using site admin token', async () => {
    const bearerToken = await createUserToken([SITE_ADMIN]);
    await createVisualisations();
    return assertNodes({ bearerToken }, 3);
  });

  it('should return all visualisations inside the org when using client basic with ALL scopes', async () => {
    const basicClient = await createClient([ALL]);
    await createVisualisations();
    return assertNodes({ basicClient }, 3);
  });

  it('should return no visualisations inside the org when using client basic with no scopes', async () => {
    const basicClient = await createClient();
    await createVisualisations();
    return assertNodes({ basicClient, expectedStatus: 403 }, 0);
  });

  it('should return only visualisations attached to dashboard with dashboard token ', async () => {
    const visualisation1 = await createVisualisation();
    const visualisation2 = await createVisualisation();
    await createVisualisation();
    const dashboardToken = await createDashboardToken({ visualisationIds: [visualisation1._id, visualisation2._id] });
    return assertNodes({ bearerToken: dashboardToken }, 2);
  });

  it('should return no visualisations with dashboard token with no visualisations', async () => {
    await createVisualisation();
    const dashboardToken = await createDashboardToken();
    return assertNodes({ bearerToken: dashboardToken }, 0);
  });
});
