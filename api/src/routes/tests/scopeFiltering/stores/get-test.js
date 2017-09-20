import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import setup from 'api/routes/tests/utils/setup';
import createStore from '../utils/createStore';
import assertGetNodes from '../utils/assertGetNodes';

describe('API HTTP GET stores route scope filtering', () => {
  const apiApp = setup();
  const assertNodes = assertGetNodes(apiApp, 'lrs');

  it('should return stores inside the org when using org token', async () => {
    const token = await createOrgToken([ALL]);
    await createStore();
    return assertNodes(token, 1);
  });

  it('should not return stores outside the org when using org token', async () => {
    const token = await createOrgToken([ALL]);
    await createStore('561a679c0c5d017e4004714a');
    return assertNodes(token, 0);
  });

  it("should return stores inside the user's org when using site admin token", async () => {
    const token = await createUserToken([SITE_ADMIN]);
    await createStore();
    return assertNodes(token, 1);
  });

  it("should return stores outside the user's org when using site admin token", async () => {
    const token = await createUserToken([SITE_ADMIN]);
    await createStore('561a679c0c5d017e4004714a');
    return assertNodes(token, 1);
  });
});
