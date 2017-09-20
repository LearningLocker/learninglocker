import * as assert from 'assert';
import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import { MANAGE_ALL_ORGANISATIONS } from 'lib/constants/orgScopes';
import setup from 'lib/services/auth/tests/utils/setup';
import testOrgScopeFilter
  from 'lib/services/auth/tests/utils/testOrgScopeFilter';
import testOrgScopeFilterError
  from 'lib/services/auth/tests/utils/testOrgScopeFilterError';
import testOrgScopeFilterOwner
  from 'lib/services/auth/tests/utils/testOrgScopeFilterOwner';
import testOwnerScopeFilterError
  from 'lib/services/auth/tests/utils/testOwnerScopeFilterError';
import getModelScopeFilter
  from 'lib/services/auth/tests/utils/getModelScopeFilter';
import testSiteAdminScopeFilter
  from 'lib/services/auth/tests/utils/testSiteAdminScopeFilter';
import testAllActions from 'lib/services/auth/tests/utils/testAllActions';
import {
  TEST_ORG_ID,
  TEST_ORG_FILTER,
  TEST_OWNER_ID
} from 'lib/services/auth/tests/utils/constants';
import createUser from 'lib/services/auth/tests/utils/createUser';
import createUserToken from 'lib/services/auth/tests/utils/createUserToken';

const modelName = 'organisation';

const TEST_USER_ORGS_FILTER = { _id: { $in: [TEST_ORG_ID] } };

describe('model scope filters organisation', () => {
  setup();

  testAllActions(modelName, [SITE_ADMIN], {});
  testAllActions(modelName, [ALL], TEST_USER_ORGS_FILTER);

  testOrgScopeFilterOwner(modelName, 'view', TEST_USER_ORGS_FILTER);
  testOrgScopeFilterOwner(modelName, 'edit', TEST_USER_ORGS_FILTER);
  testOrgScopeFilterOwner(modelName, 'create', TEST_USER_ORGS_FILTER);
  testOrgScopeFilterOwner(modelName, 'delete', TEST_USER_ORGS_FILTER);

  testOrgScopeFilter(modelName, 'view', [], TEST_USER_ORGS_FILTER);
  testOrgScopeFilterError(modelName, 'edit', []);
  testOrgScopeFilterError(modelName, 'create', []);
  testOrgScopeFilterError(modelName, 'delete', []);

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
    TEST_ORG_FILTER
  );
  testOrgScopeFilterError(modelName, 'create', [MANAGE_ALL_ORGANISATIONS]);
  testOrgScopeFilterError(modelName, 'delete', [MANAGE_ALL_ORGANISATIONS]);

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

  testOwnerScopeFilterError(modelName, 'edit');
  testOwnerScopeFilterError(modelName, 'create');
  testOwnerScopeFilterError(modelName, 'delete');

  testSiteAdminScopeFilter(modelName, 'view', {});
  testSiteAdminScopeFilter(modelName, 'edit', {});
  testSiteAdminScopeFilter(modelName, 'create', {});
  testSiteAdminScopeFilter(modelName, 'delete', {});
});
