import assert from 'assert';
import uuid from 'uuid';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import * as orgScopes from 'lib/constants/orgScopes';
import Organisation from 'lib/models/organisation';
import User from 'lib/models/user';
import Role from 'lib/models/role';
import setup from 'api/routes/tests/utils/setup';
import { createOrgJWT } from 'api/auth/jwt';

describe('userOrganisations.router', () => {
  const apiApp = setup();

  /**
   * organisation ids
   */
  const org1Id = 'ffffaaaa0000aaaa0000aaaa';
  const org2Id = 'ffffaaaa1111aaaa1111aaaa';

  /**
   * users
   */
  const masterUserId = 'ffffbbbb0000bbbb0000bbbb';

  /**
   * roles who have a variety of scopes
   */
  const allRoleId = 'ffffcccc0000cccc0000cccc';
  const userManagerRoleId = 'ffffcccc1111cccc1111cccc';
  const nonUserManagerRoleId = 'ffffcccc2222cccc2222cccc';

  /**
   * @returns {Promise<User>}
   */
  const createLoginUser = async (scopes, organisationSettings = []) => {
    const loginUser = await User.create({
      name: 'login user',
      email: `login-user-${uuid.v4()}@example.com`,
      scopes,
      organisations: [org1Id, org2Id],
      organisationSettings,
      verified: true,
    });
    return loginUser;
  };

  /**
   * @returns {Promise<User>}
   */
  const createTargetUser = async (organisations = []) => {
    const anotherUser = await User.create({
      name: 'target user',
      email: `target-user-${uuid.v4()}@example.com`,
      scopes: [],
      organisations,
      organisationSettings: [],
      verified: true,
    });
    return anotherUser;
  };

  beforeEach(async () => {
    // create organisations
    await Organisation.create({
      _id: org1Id,
      name: 'organisation 1',
      owner: masterUserId,
    });

    await Organisation.create({
      _id: org2Id,
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

  describe('site admin', () => {
    let siteAdminOrg1Token;

    beforeEach(async () => {
      const loginUser = await createLoginUser([SITE_ADMIN], []);
      siteAdminOrg1Token = await createOrgJWT(loginUser, org1Id, 'native');
    });

    it('can remove an organisation from any users', async () => {
      const targetUser = await createTargetUser([org1Id, org2Id]);

      await apiApp
        .delete(`/v2/users/${targetUser._id}/organisations/${org1Id}`)
        .set('Authorization', `Bearer ${siteAdminOrg1Token}`)
        .expect(200);

      const updatedTargetUser = await User.findOne({ _id: targetUser._id });
      assert.equal(updatedTargetUser.organisations.length, 1);
      assert.equal(updatedTargetUser.organisations[0].toString(), org2Id);
    });

    it('succeeds but do nothing if the target organisationId is not exists', async () => {
      const targetUser = await createTargetUser([org2Id]);

      await apiApp
        .delete(`/v2/users/${targetUser._id}/organisations/${org1Id}`)
        .set('Authorization', `Bearer ${siteAdminOrg1Token}`)
        .expect(200);

      const updatedTargetUser = await User.findOne({ _id: targetUser._id });
      assert.equal(updatedTargetUser.organisations.length, 1);
      assert.equal(updatedTargetUser.organisations[0].toString(), org2Id);
    });
  });

  describe('a user manager of org1', () => {
    let userManagerOrg1Token;
    let loginUser;

    beforeEach(async () => {
      const organisationSettings = [{
        organisation: org1Id,
        roles: [userManagerRoleId],
      }];
      loginUser = await createLoginUser([], organisationSettings);
      userManagerOrg1Token = await createOrgJWT(loginUser, org1Id, 'native');
    });

    it('can remove an organisation from any users', async () => {
      const targetUser = await createTargetUser([org1Id]);

      await apiApp
        .delete(`/v2/users/${targetUser._id}/organisations/${org1Id}`)
        .set('Authorization', `Bearer ${userManagerOrg1Token}`)
        .expect(200);
    });
  });

  describe('a user who does not have manage users', () => {
    let nonUserManagerOrg1Token;
    let loginUser;

    beforeEach(async () => {
      const organisationSettings = [{
        organisation: org1Id,
        roles: [nonUserManagerRoleId],
      }];
      loginUser = await createLoginUser([], organisationSettings);
      nonUserManagerOrg1Token = await createOrgJWT(loginUser, org1Id, 'native');
    });

    it('can not remove an organisation from any users', async () => {
      const targetUser = await createTargetUser();

      await apiApp
        .delete(`/v2/users/${targetUser._id}/organisations/${org1Id}`)
        .set('Authorization', `Bearer ${nonUserManagerOrg1Token}`)
        .expect(401);
    });
  });
});
