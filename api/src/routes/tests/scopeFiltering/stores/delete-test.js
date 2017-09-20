import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import { MANAGE_ALL_STORES } from 'lib/constants/orgScopes';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import createOwnerOrgToken
  from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import setup from 'api/routes/tests/utils/setup';
import { RESTIFY_PREFIX } from 'lib/constants/routes';
import createStore from '../utils/createStore';

describe('API HTTP DELETE stores route scope filtering', () => {
  const apiApp = setup();

  const assertAction = async ({ token, expectedCode }) => {
    const store = await createStore();
    const storeId = store._id.toString();
    return apiApp
      .delete(`${RESTIFY_PREFIX}/lrs/${storeId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .expect(expectedCode);
  };

  const assertAuthorised = ({ token }) =>
    assertAction({ token, expectedCode: 204 });

  const assertUnauthorised = ({ token }) =>
    assertAction({ token, expectedCode: 403 });

  it('should do action inside the org when using all scope', async () => {
    const token = await createOrgToken([ALL]);
    await assertAuthorised({ token });
  });

  it('should not do action inside the org when using no scopes', async () => {
    const token = await createOrgToken([]);
    await assertUnauthorised({ token });
  });

  it('should do action inside the org when using edit all scope', async () => {
    const token = await createOrgToken([MANAGE_ALL_STORES]);
    await assertAuthorised({ token });
  });

  it('should do action inside the org when using owner org token', async () => {
    const token = await createOwnerOrgToken();
    await assertAuthorised({ token });
  });

  it('should do action inside the org when using site admin token', async () => {
    const token = await createUserToken([SITE_ADMIN]);
    await assertAuthorised({ token });
  });
});
