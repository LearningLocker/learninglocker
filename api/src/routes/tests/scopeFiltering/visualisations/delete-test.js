import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import {
  EDIT_ALL_VISUALISATIONS,
  EDIT_PUBLIC_VISUALISATIONS
} from 'lib/constants/orgScopes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import createOwnerOrgToken
  from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import setup from 'api/routes/tests/utils/setup';
import { RESTIFY_PREFIX } from 'lib/constants/routes';
import createVisualisation from '../utils/createVisualisation';

describe('API HTTP DELETE visualisations route scope filtering', () => {
  const apiApp = setup();

  const assertAction = async ({ token }) => {
    const model = await createVisualisation();
    const modelId = model._id.toString();
    return apiApp
      .delete(`${RESTIFY_PREFIX}/visualisation/${modelId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .expect(204);
  };

  it('should create inside the org when using all scope', async () => {
    const token = await createOrgToken([ALL]);
    await assertAction({ token });
  });

  it('should create inside the org when using no scopes', async () => {
    const token = await createOrgToken([]);
    await assertAction({ token });
  });

  it('should create inside the org when using edit all scope', async () => {
    const token = await createOrgToken([EDIT_ALL_VISUALISATIONS]);
    await assertAction({ token });
  });

  it('should create inside the org when using edit public scope', async () => {
    const token = await createOrgToken([EDIT_PUBLIC_VISUALISATIONS]);
    await assertAction({ token });
  });

  it('should create inside the org when using owner org token', async () => {
    const token = await createOwnerOrgToken();
    await assertAction({ token });
  });

  it('should create inside the org when using site admin token', async () => {
    const token = await createUserToken([SITE_ADMIN]);
    await assertAction({ token });
  });
});
