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
import testOwnerScopeFilterError
  from 'lib/services/auth/tests/utils/testOwnerScopeFilterError';
import testSiteAdminScopeFilterError
  from 'lib/services/auth/tests/utils/testSiteAdminScopeFilterError';
import { TEST_ORG_FILTER } from 'lib/services/auth/tests/utils/constants';

const TEST_ORG_STATEMENT_FILTER = {
  ...TEST_ORG_FILTER,
  test: 1
};

const modelName = 'statement';

describe('model scope filters statement', () => {
  setup();

  testOrgScopeFilter(
    modelName,
    'view',
    [SITE_ADMIN],
    TEST_ORG_STATEMENT_FILTER
  );
  testOrgScopeFilterError(modelName, 'edit', [SITE_ADMIN]);
  testOrgScopeFilterError(modelName, 'create', [SITE_ADMIN]);
  testOrgScopeFilterError(modelName, 'delete', [SITE_ADMIN]);

  testOrgScopeFilter(modelName, 'view', [ALL], TEST_ORG_STATEMENT_FILTER);
  testOrgScopeFilterError(modelName, 'edit', [ALL]);
  testOrgScopeFilterError(modelName, 'create', [ALL]);
  testOrgScopeFilterError(modelName, 'delete', [ALL]);

  testOrgScopeFilterOwner(modelName, 'view', TEST_ORG_STATEMENT_FILTER);
  testOrgScopeFilterOwnerError(modelName, 'edit', TEST_ORG_STATEMENT_FILTER);
  testOrgScopeFilterOwnerError(modelName, 'create', TEST_ORG_STATEMENT_FILTER);
  testOrgScopeFilterOwnerError(modelName, 'delete', TEST_ORG_STATEMENT_FILTER);

  testOrgScopeFilter(modelName, 'view', [], TEST_ORG_STATEMENT_FILTER);
  testOrgScopeFilterError(modelName, 'edit', []);
  testOrgScopeFilterError(modelName, 'create', []);
  testOrgScopeFilterError(modelName, 'delete', []);

  testOrgScopeFilter(
    modelName,
    'view',
    [MANAGE_ALL_USERS],
    TEST_ORG_STATEMENT_FILTER
  );
  testOrgScopeFilterError(modelName, 'edit', [MANAGE_ALL_USERS]);
  testOrgScopeFilterError(modelName, 'create', [MANAGE_ALL_USERS]);
  testOrgScopeFilterError(modelName, 'delete', [MANAGE_ALL_USERS]);

  testOwnerScopeFilterError(modelName, 'view');
  testOwnerScopeFilterError(modelName, 'edit');
  testOwnerScopeFilterError(modelName, 'create');
  testOwnerScopeFilterError(modelName, 'delete');

  testSiteAdminScopeFilterError(modelName, 'view');
  testSiteAdminScopeFilterError(modelName, 'edit');
  testSiteAdminScopeFilterError(modelName, 'create');
  testSiteAdminScopeFilterError(modelName, 'delete');
});
