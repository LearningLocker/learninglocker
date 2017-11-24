import * as assert from 'assert';
import union from 'lodash/union';
import map from 'lodash/map';
import mongoose from 'mongoose';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import { MANAGE_ALL_USERS } from 'lib/constants/orgScopes';
import {
  TEST_ORG_ID
} from 'lib/services/auth/tests/utils/constants';
import testId from 'api/routes/tests/utils/testId';
import createUser from 'api/routes/tests/utils/models/createUser';
import createClient from 'api/routes/tests/utils/models/createClient';
import createOrgToken from 'api/routes/tests/utils/tokens/createOrgToken';
import createUserToken from 'api/routes/tests/utils/tokens/createUserToken';
import createOwnerOrgToken
from 'api/routes/tests/utils/tokens/createOwnerOrgToken';
import setup from 'api/routes/tests/utils/setup';
import { RESTIFY_PREFIX } from 'lib/constants/routes';

const objectId = mongoose.Types.ObjectId;
const USER_TEST_EMAIL = 'test@test.com';

describe('API HTTP POST users route scope filtering', () => {
  const apiApp = setup();

  const assertCreate = ({ bearerToken, basicClient, expectedCode, additionalUserData = {} }) => {
    const test = apiApp
      .post(`${RESTIFY_PREFIX}/user`)
      .set('Content-Type', 'application/json');

    if (bearerToken) {
      test.set('Authorization', `Bearer ${bearerToken}`);
    } else if (basicClient) {
      test.auth(basicClient.api.basic_key, basicClient.api.basic_secret);
    }
    test.expect(expectedCode);
    return test.send({
      email: USER_TEST_EMAIL,
      ...additionalUserData
    });
  };

  const assertAuthorised = ({ bearerToken, basicClient, additionalUserData = {} }) =>
    assertCreate({ bearerToken, basicClient, expectedCode: 201, additionalUserData });

  const assertUnauthorised = ({ bearerToken, basicClient }) =>
    assertCreate({ bearerToken, basicClient, expectedCode: 403 });

  const assertUserCreation = async ({ bearerToken, basicClient }) => {
    const organisations = [objectId().toString()];
    const email = 'user1@test.com';
    const existingUser = await createUser({ _id: null, email, organisations });
    await assertAuthorised({ bearerToken, basicClient, additionalUserData: { email } }).expect((res) => {
      const stringExistingOrganisations = map(existingUser.organisations, id => id.toString());
      assert.deepEqual(res.body.organisations, union([testId.toString()], stringExistingOrganisations), 'Expected existing user to be in org for org token');
      assert.equal(res.body.email, email, 'Expected emails to match');
    });
  };

  it('should create inside the org when using all scope', async () => {
    const bearerToken = await createOrgToken([ALL]);
    await assertAuthorised({ bearerToken });
  });

  it('should append organisation when POSTing existing user inside the org when using all scope ', async () => {
    const bearerToken = await createOrgToken([ALL]);
    await assertUserCreation({ bearerToken });
  });

  it('should not create inside the org when using no scopes', async () => {
    const bearerToken = await createOrgToken([]);
    await assertUnauthorised({ bearerToken });
  });

  it('should create inside the org when using MANAGE_ALL_USERS scope', async () => {
    const bearerToken = await createOrgToken([MANAGE_ALL_USERS]);
    await assertAuthorised({ bearerToken });
  });

  it('should not create inside the org when using owner org token', async () => {
    const bearerToken = await createOwnerOrgToken();
    await assertUnauthorised({ bearerToken });
  });

  it('should create new user with no orgs when using site admin token', async () => {
    const bearerToken = await createUserToken([SITE_ADMIN]);
    await assertAuthorised({ bearerToken });
  });

  it('should create inside the org when using site admin token and passing organisations', async () => {
    const bearerToken = await createUserToken([SITE_ADMIN]);
    const organisations = [TEST_ORG_ID.toString()];
    await assertAuthorised({ bearerToken, additionalUserData: { organisations } }).expect((res) => {
      assert.deepEqual(res.body.organisations, organisations, 'Expected created user to have same organisations');
    });
  });

  it('should create inside the org when using basic client with ALL scopes', async () => {
    const basicClient = await createClient([ALL]);
    await assertAuthorised({ basicClient });
  });

  it('should create inside the org when using basic client with ALL scopes and additional orgs including the tokens org', async () => {
    const otherOrg = objectId().toString();
    const basicClient = await createClient([ALL]);
    await assertAuthorised({ basicClient, additionalUserData: { organisations: [otherOrg, testId] } }).expect((res) => {
      assert.deepEqual(res.body.organisations, [testId.toString()], 'Expected created user to have same organisations');
    });
  });

  it('should create inside the org when using basic client with ALL scopes and additional orgs including the tokens org', async () => {
    const otherOrg = objectId().toString();
    const basicClient = await createClient([ALL]);
    await assertCreate({ basicClient, additionalUserData: { organisations: [otherOrg] }, expectedCode: 400 });
  });

  it('should patch existing user inside the org when using basic client with ALL scopes and additional orgs including the tokens org and existing user is not in token org', async () => {
    const newOrgId = objectId().toString();
    const email = 'user1@test.com';
    await createUser({ _id: null, email, organisations: [newOrgId] });

    const basicClient = await createClient([ALL]);
    const tokenOrgId = testId.toString();

    await assertCreate({ basicClient, additionalUserData: { email, organisations: [tokenOrgId] }, expectedCode: 201 }).expect((res) => {
      assert.deepEqual(res.body.organisations, [tokenOrgId, newOrgId], 'Expected created user to have same organisations');
    });
  });

  it('should patch existing user inside the org when using basic client with ALL scopes and additional orgs including the tokens org and existing user is already in token org', async () => {
    const tokenOrgId = testId.toString();
    const newOrgID = objectId().toString();
    const email = 'user1@test.com';
    await createUser({ _id: null, email, organisations: [newOrgID, tokenOrgId] });

    const basicClient = await createClient([ALL]);

    await assertCreate({ basicClient, additionalUserData: { email, organisations: [tokenOrgId] }, expectedCode: 201 }).expect((res) => {
      assert.deepEqual(res.body.organisations, [newOrgID, tokenOrgId], 'Expected created user to have same organisations');
    });
  });

  it('should append organisation when POSTing existing user inside the org when using all scope ', async () => {
    const basicClient = await createClient([ALL]);
    await assertUserCreation({ basicClient });
  });

  it('should not create inside the org when using basic client with no scopes', async () => {
    const basicClient = await createClient();
    await assertUnauthorised({ basicClient });
  });
});
