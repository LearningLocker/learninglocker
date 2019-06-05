import * as assert from 'assert';
import { RESTIFY_PREFIX } from 'lib/constants/routes';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import * as orgScopes from 'lib/constants/orgScopes';
import Organisation from 'lib/models/organisation';
import User from 'lib/models/user';
import Role from 'lib/models/role';
import { createOrgJWT } from 'api/auth/jwt';
import setup from 'api/routes/tests/utils/setup';

describe('API HTTP PATCH user route', () => {
  const apiApp = setup();

  /**
   * organisation ids
   *
   * currentOrgId is a token's target organisation
   */
  const currentOrgId = '0000aaaa0000aaaa0000aaaa';
  const anotherOrgId = '1111aaaa1111aaaa1111aaaa';

  /**
   * users
   *
   * loginUser is a token owner
   */
  const masterUserId = '0000bbbb0000bbbb0000bbbb';

  /**
   * roles who have a variety of scopes
   *
   * organisation is currentOrgId
   */
  const allRoleId = '0000cccc0000cccc0000cccc';
  const userManagerRoleId = '1111cccc1111cccc1111cccc';
  const nonUserManagerRoleId = '2222cccc2222cccc2222cccc';

  const updateUser = async (token, userId, body) =>
    apiApp
      .patch(`${RESTIFY_PREFIX}/user/${userId}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  const createLoginUser = async (scopes, organisationSettings = []) => {
    const loginUser = await User.create({
      name: 'login user',
      email: 'login-user@example.com',
      scopes,
      organisations: [
        currentOrgId,
        anotherOrgId,
      ],
      organisationSettings,
      verified: true,
    });
    return loginUser;
  };

  const createAnotherUser = async () => {
    const anotherUser = await User.create({
      name: 'another user',
      email: 'another-user@example.com',
      scopes: [],
      organisations: [
        currentOrgId,
        anotherOrgId,
      ],
      verified: true,
    });
    return anotherUser;
  };

  before(async () => {
    // create organisations
    await Organisation.create({
      _id: currentOrgId,
      name: 'organisation 1',
      owner: masterUserId,
    });

    await Organisation.create({
      _id: anotherOrgId,
      name: 'organisation 2',
      owner: masterUserId,
    });

    // create masterUser
    await User.create({
      _id: masterUserId,
      name: 'master user',
      email: 'master@example.com',
    });

    // create roles
    await Role.create({
      _id: allRoleId,
      scopes: [ALL],
    });

    await Role.create({
      _id: userManagerRoleId,
      scopes: [orgScopes.MANAGE_ALL_USERS],
    });

    await Role.create({
      _id: nonUserManagerRoleId,
      scopes: orgScopes.default.filter(s => ![ALL, orgScopes.MANAGE_ALL_USERS].includes(s)),
    });
  });

  describe('scope who has "site_admin"', () => {
    it('can update any fields of themselves', async () => {
      // create loginUser
      const loginUser = await createLoginUser([SITE_ADMIN]);

      // create org token for loginUser
      const token = await createOrgJWT(loginUser, currentOrgId, 'native');

      // try to update loginUser
      const res = await updateUser(token, loginUser._id, {
        name: 'updated name',
        organisationSettings: [
          {
            organisation: currentOrgId,
            scopes: [],
            roles: [nonUserManagerRoleId],
            filter: '{"key":"updated 1"}',
            samlEnabled: true,
          },
          {
            organisation: anotherOrgId,
            scopes: [],
            roles: [],
            filter: '{"key":"updated 2"}',
            samlEnabled: false,
          },
        ],
      });

      // response is expected
      assert.equal(res.status, 200);
      assert.equal(res.body.name, 'updated name');

      // loginUser in DB is updated
      const updated = await User.findOne({ _id: loginUser._id });
      assert.equal(updated.name, 'updated name');
      assert.equal(updated.organisationSettings.length, 2);

      assert.deepEqual(updated.organisationSettings[0].scopes.length, 0);
      assert.deepEqual(updated.organisationSettings[0].roles.map(r => r.toString()), [nonUserManagerRoleId]);
      assert.deepEqual(updated.organisationSettings[0].filter, '{"key":"updated 1"}');
      // assert.deepEqual(updated.organisationSettings[0].samlEnabled, true);

      assert.deepEqual(updated.organisationSettings[1].scopes.length, 0);
      assert.deepEqual(updated.organisationSettings[1].roles.length, 0);
      assert.deepEqual(updated.organisationSettings[1].filter, '{"key":"updated 2"}');
      // assert.deepEqual(updated.organisationSettings[0].samlEnabled, false);
    });

    it('can update any fields of any users', async () => {
      // create loginUser
      const loginUser = await createLoginUser([SITE_ADMIN]);

      // create anotherUser
      const anotherUser = await createAnotherUser();

      // create org token for loginUser
      const token = await createOrgJWT(loginUser, currentOrgId, 'native');

      // try to update anotherUser
      const res = await updateUser(token, anotherUser._id, {
        name: 'updated name',
        organisationSettings: [
          {
            organisation: currentOrgId,
            scopes: [],
            roles: [nonUserManagerRoleId],
            filter: '{"key":"updated 1"}',
            samlEnabled: true,
          },
          {
            organisation: anotherOrgId,
            scopes: [],
            roles: [],
            filter: '{"key":"updated 2"}',
            samlEnabled: false,
          },
        ],
      });

      // 200 is expected
      assert.equal(res.status, 200);
      assert.equal(res.body.name, 'updated name');

      // anotherUser in DB is updated
      const updated = await User.findOne({ _id: anotherUser._id });
      assert.equal(updated.name, 'updated name');
      assert.equal(updated.organisationSettings.length, 2);

      assert.deepEqual(updated.organisationSettings[0].scopes.length, 0);
      assert.deepEqual(updated.organisationSettings[0].roles.map(r => r.toString()), [nonUserManagerRoleId]);
      assert.deepEqual(updated.organisationSettings[0].filter, '{"key":"updated 1"}');
      // assert.deepEqual(updated.organisationSettings[0].samlEnabled, true);

      assert.deepEqual(updated.organisationSettings[1].scopes.length, 0);
      assert.deepEqual(updated.organisationSettings[1].roles.length, 0);
      assert.deepEqual(updated.organisationSettings[1].filter, '{"key":"updated 2"}');
      // assert.deepEqual(updated.organisationSettings[0].samlEnabled, false);
    });
  });

  // Should test ALL scope user?
  // describe('scope who has "all"', () => {
  // });

  describe('scope who has "org/all/user/manage"', () => {
    const createUserManager = async () => {
      const loginUser = await createLoginUser([], [
        {
          organisation: currentOrgId,
          scopes: [],
          roles: [userManagerRoleId],
          filter: '{"key":"login user 1"}',
        },
        {
          organisation: anotherOrgId,
          scopes: [],
          roles: [userManagerRoleId],
          filter: '{"key":"login user 2"}',
        }
      ]);
      return loginUser;
    };

    it('can update some current organisation\'s fields of themselves ???', async () => {
      // create loginUser
      const loginUser = await createUserManager();

      // create org token for loginUser
      const token = await createOrgJWT(loginUser, currentOrgId, 'native');

      // try to update loginUser
      const res = await updateUser(token, loginUser._id, {
        name: 'updated name',
        organisationSettings: [
          {
            organisation: currentOrgId,
            scopes: [ALL],
            roles: [userManagerRoleId, nonUserManagerRoleId],
            filter: '{"key":"updated"}',
          },
          {
            organisation: anotherOrgId,
            scopes: [],
            roles: [userManagerRoleId],
            filter: '{"key":"login user 2"}',
          }
        ],
      });

      // 200 is expected
      assert.equal(res.status, 200);
      assert.equal(res.body.name, 'updated name');

      // loginUser in DB is updated
      const updated = await User.findOne({ _id: loginUser._id });
      assert.equal(updated.name, 'updated name');
      assert.equal(updated.organisationSettings.length, 2);

      assert.deepEqual(updated.organisationSettings[0].scopes.map(r => r.toString()), [ALL]);
      assert.deepEqual(updated.organisationSettings[0].roles.map(r => r.toString()), [userManagerRoleId, nonUserManagerRoleId]);
      assert.deepEqual(updated.organisationSettings[0].filter, '{"key":"updated"}');
    });

    it('can not update another organisation fields of themselves', async () => {
      // create loginUser
      const loginUser = await createUserManager();

      // create org token for loginUser
      const token = await createOrgJWT(loginUser, currentOrgId, 'native');

      // try to update loginUser
      const res = await updateUser(token, loginUser._id, {
        organisationSettings: [
          {
            organisation: currentOrgId,
            scopes: [],
            roles: [userManagerRoleId],
            filter: '{"key":"login user 1"}',
          },
          {
            organisation: anotherOrgId,
            scopes: [ALL],
            roles: [userManagerRoleId, nonUserManagerRoleId],
            filter: '{"key":"updated"}',
          },
        ],
      });

      // 401 is expected
      assert.equal(res.status, 401);

      // loginUser in DB is not updated
      const updated = await User.findOne({ _id: loginUser._id });
      assert.equal(updated.organisationSettings[0].organisation, currentOrgId);
    });

    it('can update some current organisation\'s fields of anyone', async () => {
      // create loginUser
      const loginUser = await createUserManager();

      // create anotherUser
      const anotherUser = await createAnotherUser();

      // create org token for loginUser
      const token = await createOrgJWT(loginUser, currentOrgId, 'native');

      // try to update anotherUser
      const res = await updateUser(token, anotherUser._id, {
        name: 'updated name',
        organisationSettings: [
          {
            organisation: currentOrgId,
            scopes: [ALL],
            roles: [nonUserManagerRoleId],
            filter: '{"key":"updated"}',
          },
        ],
      });

      // 200 is expected
      assert.equal(res.status, 200);
      assert.equal(res.body.name, 'updated name');

      // anotherUser in DB is updated
      const updated = await User.findOne({ _id: anotherUser._id });
      assert.equal(updated.name, 'updated name');
      assert.equal(updated.organisationSettings.length, 1);

      assert.deepEqual(updated.organisationSettings[0].scopes.map(r => r.toString()), [ALL]);
      assert.deepEqual(updated.organisationSettings[0].roles.map(r => r.toString()), [nonUserManagerRoleId]);
      assert.deepEqual(updated.organisationSettings[0].filter, '{"key":"updated"}');
    });

    it('can not update the other fields of anther user', async () => {
      // create loginUser
      const loginUser = await createUserManager();

      // create anotherUser
      const anotherUser = await createAnotherUser();

      // create org token for loginUser
      const token = await createOrgJWT(loginUser, currentOrgId, 'native');

      // try to update anotherUser
      const res = await updateUser(token, anotherUser._id, {
        organisationSettings: [
          {
            organisation: anotherOrgId,
            scopes: [ALL],
            roles: [nonUserManagerRoleId],
            filter: '{"key":"updated"}',
          },
        ],
      });

      // 401 is expected
      assert.equal(res.status, 401);

      // anotherUser in DB is not updated
      const updated = await User.findOne({ _id: anotherUser._id });
      assert.equal(updated.organisationSettings[0].organisation, currentOrgId);
    });
  });

  describe('scope who has all scopes other than "all" and "org/all/user/manage"', () => {
    const createNonUserManager = async () => {
      const loginUser = await createLoginUser([], [{
        organisation: currentOrgId,
        scopes: [],
        roles: [nonUserManagerRoleId],
        filter: '{"key":"login user"}',
      }]);
      return loginUser;
    };

    it('can update some current organisation\'s fields of themselves', async () => {
      // create loginUser
      // create org token for loginUser
      // try to update loginUser
      // 200 is expected
      // requested fields are updated
    });

    it('can not update another organisation fields of themselves', async () => {
      // create loginUser
      // create org token for loginUser
      // try to update loginUser
      // 401 is expected
    });

    it('can not update any fields of anther user', async () => {
      // create loginUser
      // create org token for loginUser
      // try to update anotherUser
      // 401 is expected
    });
  });
});
