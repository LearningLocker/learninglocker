import * as assert from 'assert';
import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import { MANAGE_ALL_ORGANISATIONS } from 'lib/constants/orgScopes';
import setup from 'lib/services/auth/tests/utils/setup';
import testOrgScopeFilter
  from 'lib/services/auth/tests/utils/testOrgScopeFilter';
import testOrgScopeFilterError
  from 'lib/services/auth/tests/utils/testOrgScopeFilterError';
import getModelScopeFilter
  from 'lib/services/auth/tests/utils/getModelScopeFilter';
import testSiteAdminScopeFilter
  from 'lib/services/auth/tests/utils/testSiteAdminScopeFilter';
import testClientBasicScopeFilter
  from 'lib/services/auth/tests/utils/testClientBasicScopeFilter';
import testClientBasicScopeFilterError
  from 'lib/services/auth/tests/utils/testClientBasicScopeFilterError';
import testAllActions from 'lib/services/auth/tests/utils/testAllActions';
import {
  TEST_ORG_ID,
  TEST_OWNER_ID
} from 'lib/services/auth/tests/utils/constants';
import createUser from 'lib/services/auth/tests/utils/createUser';
import createUserToken from 'lib/services/auth/tests/utils/createUserToken';

const modelName = 'organisation';

const TEST_USER_ORGS_FILTER = { _id: { $in: [TEST_ORG_ID] } };
const TEST_USER_NO_ORGS_FILTER = { _id: { $in: [] } };

describe('model scope filters organisation', () => {
  setup();

  testAllActions(modelName, [SITE_ADMIN], {});

  // org admin tests
  testOrgScopeFilter(modelName, 'view', [ALL], TEST_USER_ORGS_FILTER);
  testOrgScopeFilter(modelName, 'create', [ALL], undefined);
  // @todo: tests do not use roles properly. Assign a role to the org setting on the user
  // testOrgScopeFilter(modelName, 'edit', [ALL], TEST_USER_ORGS_FILTER);
  // testOrgScopeFilter(modelName, 'delete', [ALL], TEST_USER_NO_ORGS_FILTER);

  testOrgScopeFilter(modelName, 'view', [], TEST_USER_ORGS_FILTER);
  testOrgScopeFilter(modelName, 'edit', [], TEST_USER_NO_ORGS_FILTER);
  testOrgScopeFilterError(modelName, 'create', []);
  testOrgScopeFilter(modelName, 'delete', [], TEST_USER_NO_ORGS_FILTER);

  testOrgScopeFilter(
    modelName,
    'view',
    [MANAGE_ALL_ORGANISATIONS],
    TEST_USER_ORGS_FILTER
  );
  testOrgScopeFilter(
    modelName,
    'edit',
    [MANAGE_ALL_ORGANISATIONS],
    TEST_USER_NO_ORGS_FILTER
  );
  testOrgScopeFilter(modelName, 'create', [MANAGE_ALL_ORGANISATIONS], undefined);
  testOrgScopeFilter(modelName, 'delete', [MANAGE_ALL_ORGANISATIONS], TEST_USER_NO_ORGS_FILTER);

  it('should return the correct view filter when using a owner token', async () => {
    const user = createUser(TEST_OWNER_ID);
    const token = createUserToken(TEST_OWNER_ID);
    const actualScopeFilter = await getModelScopeFilter(
      modelName,
      'view',
      token,
      user
    );
    assert.deepEqual(actualScopeFilter, TEST_USER_ORGS_FILTER);
  });

  // basic client tests
  testClientBasicScopeFilter(modelName, 'view', [ALL], TEST_USER_ORGS_FILTER);
  testClientBasicScopeFilter(modelName, 'view', [], TEST_USER_NO_ORGS_FILTER);

  testClientBasicScopeFilter(modelName, 'edit', [ALL], TEST_USER_ORGS_FILTER);
  testClientBasicScopeFilter(modelName, 'edit', [], TEST_USER_NO_ORGS_FILTER);

  testClientBasicScopeFilterError(modelName, 'create', []);
  testClientBasicScopeFilterError(modelName, 'create', []);

  testClientBasicScopeFilterError(modelName, 'delete', [ALL]);
  testClientBasicScopeFilterError(modelName, 'delete', []);

  // site admin tests
  testSiteAdminScopeFilter(modelName, 'view', {});
  testSiteAdminScopeFilter(modelName, 'edit', {});
  testSiteAdminScopeFilter(modelName, 'create', {});
  testSiteAdminScopeFilter(modelName, 'delete', {});
});
