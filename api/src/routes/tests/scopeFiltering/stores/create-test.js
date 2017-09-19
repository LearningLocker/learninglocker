import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import { MANAGE_ALL_STORES } from 'lib/constants/orgScopes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import createOwnerOrgToken
  from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import setup from 'api/routes/tests/utils/setup';
import { RESTIFY_PREFIX } from 'lib/constants/routes';

describe('API HTTP POST stores route scope filtering', () => {
  const apiApp = setup();

  const assertCreate = ({ token, expectedCode }) =>
    apiApp
      .post(`${RESTIFY_PREFIX}/lrs`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .expect(expectedCode);

  const assertAuthorised = ({ token }) =>
    assertCreate({ token, expectedCode: 201 });

  const assertUnauthorised = ({ token }) =>
    assertCreate({ token, expectedCode: 403 });

  it('should create inside the org when using all scope', async () => {
    const token = await createOrgToken([ALL]);
    await assertAuthorised({ token });
  });

  it('should not create inside the org when using no scopes', async () => {
    const token = await createOrgToken([]);
    await assertUnauthorised({ token });
  });

  it('should create inside the org when using edit all scope', async () => {
    const token = await createOrgToken([MANAGE_ALL_STORES]);
    await assertAuthorised({ token });
  });

  it('should create inside the org when using owner org token', async () => {
    const token = await createOwnerOrgToken();
    await assertAuthorised({ token });
  });

  it('should create inside the org when using site admin token', async () => {
    const token = await createUserToken([SITE_ADMIN]);
    await assertAuthorised({ token });
  });
});
