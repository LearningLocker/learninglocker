import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import { MANAGE_ALL_USERS } from 'lib/constants/orgScopes';
import setup from 'lib/services/auth/tests/utils/setup';
import testOrgScopeFilter
  from 'lib/services/auth/tests/utils/testOrgScopeFilter';
import testOrgScopeFilterError
  from 'lib/services/auth/tests/utils/testOrgScopeFilterError';
import testOrgScopeFilterOwner
  from 'lib/services/auth/tests/utils/testOrgScopeFilterOwner';
import testOrgScopeFilterOwnerError
  from 'lib/services/auth/tests/utils/testOrgScopeFilterOwnerError';
import testOwnerScopeFilter
  from 'lib/services/auth/tests/utils/testOwnerScopeFilter';
import testOwnerScopeFilterError
  from 'lib/services/auth/tests/utils/testOwnerScopeFilterError';
import testSiteAdminScopeFilter
  from 'lib/services/auth/tests/utils/testSiteAdminScopeFilter';
import testAllActions from 'lib/services/auth/tests/utils/testAllActions';
import {
  TEST_ORG_ID,
  TEST_USER_ID,
  TEST_OWNER_ID
} from 'lib/services/auth/tests/utils/constants';

const modelName = 'user';

const TEST_ORGS_FILTER = { organisations: TEST_ORG_ID };
const TEST_USER_FILTER = { _id: TEST_USER_ID };
const TEST_OWNER_FILTER = { _id: TEST_OWNER_ID };

describe('model scope filters user', () => {
  setup();

  testAllActions(modelName, [SITE_ADMIN], TEST_ORGS_FILTER);
  testAllActions(modelName, [ALL], TEST_ORGS_FILTER);

  testOrgScopeFilterOwner(modelName, 'view', TEST_ORGS_FILTER);
  testOrgScopeFilterOwner(modelName, 'edit', TEST_OWNER_FILTER);
  testOrgScopeFilterOwnerError(modelName, 'create');
  testOrgScopeFilterOwnerError(modelName, 'delete');

  testOrgScopeFilter(modelName, 'view', [], TEST_ORGS_FILTER);
  testOrgScopeFilter(modelName, 'edit', [], TEST_USER_FILTER);
  testOrgScopeFilterError(modelName, 'create', []);
  testOrgScopeFilterError(modelName, 'delete', []);

  testOrgScopeFilter(modelName, 'view', [MANAGE_ALL_USERS], TEST_ORGS_FILTER);
  testOrgScopeFilter(modelName, 'edit', [MANAGE_ALL_USERS], TEST_ORGS_FILTER);
  testOrgScopeFilter(modelName, 'create', [MANAGE_ALL_USERS], TEST_ORGS_FILTER);
  testOrgScopeFilterError(modelName, 'delete', [MANAGE_ALL_USERS]);

  testOwnerScopeFilter(modelName, 'view', TEST_OWNER_FILTER);
  testOwnerScopeFilter(modelName, 'edit', TEST_OWNER_FILTER);
  testOwnerScopeFilterError(modelName, 'create');
  testOwnerScopeFilterError(modelName, 'delete');

  testSiteAdminScopeFilter(modelName, 'view', {});
  testSiteAdminScopeFilter(modelName, 'edit', {});
  testSiteAdminScopeFilter(modelName, 'create', {});
  testSiteAdminScopeFilter(modelName, 'delete', {});
});
