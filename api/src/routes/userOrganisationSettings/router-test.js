import mongoose from 'mongoose';
import uuid from 'uuid';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import * as orgScopes from 'lib/constants/orgScopes';
import Organisation from 'lib/models/organisation';
import User from 'lib/models/user';
import Role from 'lib/models/role';
import setup from 'api/routes/tests/utils/setup';
import { createOrgJWT } from 'api/auth/jwt';

const objectId = mongoose.Types.ObjectId;

describe('userOrganisationSettings.router', () => {
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

  const org1OrganisationSetting = {
    organisation: objectId(org1Id),
    scopes: '',
    roles: [],
    filter: '{}',
    timezone: 'Europe/London',
  };

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
  const createTargetUser = async (organisationSettings = []) => {
    const anotherUser = await User.create({
      name: 'target user',
      email: `target-user-${uuid.v4()}@example.com`,
      scopes: [],
      organisations: [org1Id, org2Id],
      organisationSettings,
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

    it('can create a organisationSettings for anyone', async () => {
      const targetUser = await createTargetUser();

      await apiApp
        .post(`/v2/users/${targetUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${siteAdminOrg1Token}`)
        .send(org1OrganisationSetting)
        .expect(200);
    });

    it('can not create a organisationSettings if organisation is not matched', async () => {
      const targetUser = await createTargetUser();

      await apiApp
        .post(`/v2/users/${targetUser._id}/organisationSettings/${org2Id}`)
        .set('Authorization', `Bearer ${siteAdminOrg1Token}`)
        .send(org1OrganisationSetting)
        .expect(401);
    });

    it('can not create a organisationSettings if organisationId in URL and organisationId in request body are not matched', async () => {
      const targetUser = await createTargetUser();

      await apiApp
        .post(`/v2/users/${targetUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${siteAdminOrg1Token}`)
        .send({
          ...org1OrganisationSetting,
          organisation: 'invalid'
        })
        .expect(400);
    });

    it('can update a organisationSettings for anyone', async () => {
      const targetUser = await createTargetUser();

      await apiApp
        .patch(`/v2/users/${targetUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${siteAdminOrg1Token}`)
        .send({ todo: 'something 2' })
        .expect(200);
    });

    it('can delete a organisationSettings for anyone', async () => {
      const targetUser = createTargetUser();

      await apiApp
        .delete(`/v2/users/${targetUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${siteAdminOrg1Token}`)
        .expect(200);
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

    it('can create a organisationSettings of org1 for anyone', async () => {
      const targetUser = await createTargetUser();

      await apiApp
        .post(`/v2/users/${targetUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${userManagerOrg1Token}`)
        .send({ todo: 'something' })
        .expect(200);
    });

    it('can not create a organisationSettings if organisation is not matched', async () => {
      const targetUser = await createTargetUser();

      await apiApp
        .post(`/v2/users/${targetUser._id}/organisationSettings/${org2Id}`)
        .set('Authorization', `Bearer ${userManagerOrg1Token}`)
        .send({ todo: 'something' })
        .expect(401);
    });

    it('can update a organisationSettings of org1 for anyone', async () => {
      const targetUser = await createTargetUser();

      await apiApp
        .patch(`/v2/users/${targetUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${userManagerOrg1Token}`)
        .send({ todo: 'something 2' })
        .expect(200);
    });

    it('can delete a organisationSettings of org1 for anyone', async () => {
      const targetUser = createTargetUser();

      await apiApp
        .delete(`/v2/users/${targetUser._id}/organisationSettings/${org1Id}`)
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

    it('can not create a organisationSettings for anyone', async () => {
      const targetUser = await createTargetUser();

      await apiApp
        .post(`/v2/users/${targetUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${nonUserManagerOrg1Token}`)
        .send({ todo: 'something' })
        .expect(401);
    });

    it('can not create its own organisationSettings of org1', async () => {
      await apiApp
        .post(`/v2/users/${loginUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${nonUserManagerOrg1Token}`)
        .send({ invalidField: 'x' })
        .expect(401);
    });

    it('can update a its own organisationSettings of org1 if body has only updatable fields', async () => {
      await apiApp
        .patch(`/v2/users/${loginUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${nonUserManagerOrg1Token}`)
        .send({ todo: 'something 2' })
        .expect(200);
    });

    it('can not update its own organisationSettings of org1 if body has not-updatable fields', async () => {
      await apiApp
        .patch(`/v2/users/${loginUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${nonUserManagerOrg1Token}`)
        .send({ invalidField: 'x' });
        // TODO .expect(401);
    });

    it('can not update another user\'s organisationSettings of org1', async () => {
      const targetUser = await createTargetUser();

      await apiApp
        .patch(`/v2/users/${targetUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${nonUserManagerOrg1Token}`)
        .send({ todo: 'something 2' })
        .expect(401);
    });

    it('can not delete a organisationSettings of org1 for anyone', async () => {
      const targetUser = createTargetUser();

      await apiApp
        .delete(`/v2/users/${targetUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${nonUserManagerOrg1Token}`)
        .expect(401);
    });

    it('can not delete its own organisationSettings of org1', async () => {
      await apiApp
        .delete(`/v2/users/${loginUser._id}/organisationSettings/${org1Id}`)
        .set('Authorization', `Bearer ${nonUserManagerOrg1Token}`)
        .send({ invalidField: 'x' })
        .expect(401);
    });
  });
});
