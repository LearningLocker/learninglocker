import * as assert from 'assert';
import keys from 'lodash/keys';
import includes from 'lodash/includes';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import { SELECT } from 'lib/services/auth/selects/models/user';
import createClient from 'api/routes/tests/utils/models/createClient';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import setup from 'api/routes/tests/utils/setup';
import createUser from '../utils/createUser';
import assertGetNodes from '../utils/assertGetNodes';

describe('API HTTP GET users route scope filtering', () => {
  const apiApp = setup();
  const assertNodes = assertGetNodes(apiApp, 'user');

  it('should return users inside the org when using org token', async () => {
    const token = await createOrgToken([ALL]);
    await createUser({ _id: '561a679c0c5d017e4004714a' });
    return assertNodes({ bearerToken: token }, 2); // we include the user attached to the token!
  });

  it('should not return users outside the org when using org token', async () => {
    const token = await createOrgToken([ALL]);
    await createUser({ _id: '561a679c0c5d017e4004714a', organisations: ['561a679c0c5d017e4004714a'] });
    return assertNodes({ bearerToken: token }, 1); // we include the user attached to the token!
  });

  it('should return users inside org when using org token and no scopes', async () => {
    const token = await createOrgToken([]);
    await createUser({ _id: '561a679c0c5d017e4004714a' });
    // we include the user attached to the token!
    return assertNodes({ bearerToken: token }, 2).expect((res) => {
      const allowedFields = keys(SELECT);

      res.body.edges.forEach((edge) => {
        const nodeKeys = keys(edge.node);
        nodeKeys.forEach((key) => {
          const includesField = includes(allowedFields, key);
          assert.ok(includesField, `${key} is not in allowed keys`);
        });
      });
    });
  });

  it('should return users inside org when using org token and no scopes, with limited fields', async () => {
    const token = await createOrgToken([]);
    await createUser({ _id: '561a679c0c5d017e4004714a' });
    const fields = {
      _id: 0,
      email: 1,
      password: 1
    };
    // we include the user attached to the token!
    return assertNodes({ bearerToken: token, queryParams: `?project=${JSON.stringify(fields)}` }, 2).expect((res) => {
      const allowedFields = keys(SELECT);

      res.body.edges.forEach((edge) => {
        const nodeKeys = keys(edge.node);
        assert.equal(edge.node._id, undefined);
        nodeKeys.forEach((key) => {
          const allowedField = includes(allowedFields, key);
          assert.ok(allowedField, `${key} is not in allowed keys`);
        });
      });
    });
  });

  it("should return users inside the user's org when using site admin token", async () => {
    const token = await createUserToken([SITE_ADMIN]);
    await createUser({ _id: '561a679c0c5d017e4004714a' });
    return assertNodes({ bearerToken: token }, 2);  // we include the user attached to the token!
  });

  it("should return users outside the user's org when using site admin token", async () => {
    const token = await createUserToken([SITE_ADMIN]);
    await createUser({ _id: '561a679c0c5d017e4004714a', organisations: ['561a679c0c5d017e4004714a'] });
    return assertNodes({ bearerToken: token }, 2); // we include the user attached to the token!
  });

  it('should return all users inside the org when using client basic with ALL scopes', async () => {
    const basicClient = await createClient([ALL]);
    await createUser({ _id: '561a679c0c5d017e4004714a' });
    return assertNodes({ basicClient }, 1); // client tokens dont have a user ;)
  });

  it('should return reject our request when using client basic with no scopes', async () => {
    const basicClient = await createClient();
    await createUser({ _id: '561a679c0c5d017e4004714a', organisations: ['561a679c0c5d017e4004714a'] });
    return assertNodes({ basicClient, expectedStatus: 403 });
  });
});
