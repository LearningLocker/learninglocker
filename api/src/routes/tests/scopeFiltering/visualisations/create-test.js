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

describe('API HTTP POST visualisations route scope filtering', () => {
  const apiApp = setup();

  const assertCreate = ({ token }) =>
    apiApp
      .post(`${RESTIFY_PREFIX}/visualisation`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .expect(201)
      .expect('Content-Type', /json/i);

  it('should create inside the org when using all scope', async () => {
    const token = await createOrgToken([ALL]);
    await assertCreate({ token });
  });

  it('should create inside the org when using no scopes', async () => {
    const token = await createOrgToken([]);
    await assertCreate({ token });
  });

  it('should create inside the org when using edit all scope', async () => {
    const token = await createOrgToken([EDIT_ALL_VISUALISATIONS]);
    await assertCreate({ token });
  });

  it('should create inside the org when using edit public scope', async () => {
    const token = await createOrgToken([EDIT_PUBLIC_VISUALISATIONS]);
    await assertCreate({ token });
  });

  it('should create inside the org when using owner org token', async () => {
    const token = await createOwnerOrgToken();
    await assertCreate({ token });
  });

  it('should create inside the org when using site admin token', async () => {
    const token = await createUserToken([SITE_ADMIN]);
    await assertCreate({ token });
  });
});
