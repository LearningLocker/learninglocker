import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import {
  VIEW_PUBLIC_VISUALISATIONS,
  VIEW_ALL_VISUALISATIONS
} from 'lib/constants/orgScopes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
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
    const token = await createOrgToken([ALL]);
    await createVisualisations(token);
    return assertNodes(token, 3);
  });

  it('should return own visualisations inside the org when using no scopes', async () => {
    const token = await createOrgToken([]);
    await createVisualisations();
    return assertNodes(token, 1);
  });

  it('should return all visualisations inside the org when using view all scope', async () => {
    const token = await createOrgToken([VIEW_ALL_VISUALISATIONS]);
    await createVisualisations();
    return assertNodes(token, 3);
  });

  it('should return public visualisations inside the org when using view public scope', async () => {
    const token = await createOrgToken([VIEW_PUBLIC_VISUALISATIONS]);
    await createVisualisations();
    return assertNodes(token, 2);
  });

  it('should return all visualisations inside the org when using site admin token', async () => {
    const token = await createUserToken([SITE_ADMIN]);
    await createVisualisations();
    return assertNodes(token, 3);
  });
});
