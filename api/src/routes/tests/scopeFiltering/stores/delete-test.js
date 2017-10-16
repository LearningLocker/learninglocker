import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import { MANAGE_ALL_STORES } from 'lib/constants/orgScopes';
import createClient from 'api/routes/tests/utils/models/createClient';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import createOwnerOrgToken
  from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import setup from 'api/routes/tests/utils/setup';
import { RESTIFY_PREFIX } from 'lib/constants/routes';
import createStore from '../utils/createStore';

describe('API HTTP DELETE stores route scope filtering', () => {
  const apiApp = setup();

  const assertAction = async ({ bearerToken, basicClient, expectedCode }) => {
    const store = await createStore();
    const storeId = store._id.toString();
    const test = apiApp
      .delete(`${RESTIFY_PREFIX}/lrs/${storeId}`);

    if (bearerToken) {
      test.set('Authorization', `Bearer ${bearerToken}`);
    } else if (basicClient) {
      test.auth(basicClient.api.basic_key, basicClient.api.basic_secret);
    }

    return test.expect(expectedCode);
  };

  const assertAuthorised = ({ bearerToken, basicClient }) =>
    assertAction({ bearerToken, basicClient, expectedCode: 204 });

  const assertUnauthorised = ({ bearerToken, basicClient }) =>
    assertAction({ bearerToken, basicClient, expectedCode: 403 });

  it('should do delete inside the org when using all scope', async () => {
    const bearerToken = await createOrgToken([ALL]);
    await assertAuthorised({ bearerToken });
  });

  it('should not do delete inside the org when using no scopes', async () => {
    const bearerToken = await createOrgToken([]);
    await assertUnauthorised({ bearerToken });
  });

  it('should do delete inside the org when using edit all scope', async () => {
    const bearerToken = await createOrgToken([MANAGE_ALL_STORES]);
    await assertAuthorised({ bearerToken });
  });

  it('should not do delete inside the org when using owner org token', async () => {
    const bearerToken = await createOwnerOrgToken();
    await assertUnauthorised({ bearerToken });
  });

  it('should do delete inside the org when using site admin token', async () => {
    const bearerToken = await createUserToken([SITE_ADMIN]);
    await assertAuthorised({ bearerToken });
  });

  it('should do delete inside the org when using basic client with ALL scopes', async () => {
    const basicClient = await createClient([ALL]);
    await assertAuthorised({ basicClient });
  });

  it('should not do delete inside the org when using basic client with no scopes', async () => {
    const basicClient = await createClient();
    await assertUnauthorised({ basicClient });
  });
});
