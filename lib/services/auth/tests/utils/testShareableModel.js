import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import setup from 'lib/services/auth/tests/utils/setup';
import testOrgScopeFilter
  from 'lib/services/auth/tests/utils/testOrgScopeFilter';
import testOwnerScopeFilterError
  from 'lib/services/auth/tests/utils/testOwnerScopeFilterError';
import testSiteAdminScopeFilter
  from 'lib/services/auth/tests/utils/testSiteAdminScopeFilter';
import testClientBasicScopeFilter
  from 'lib/services/auth/tests/utils/testClientBasicScopeFilter';
import testClientBasicScopeFilterError
  from 'lib/services/auth/tests/utils/testClientBasicScopeFilterError';
import testAllActions from 'lib/services/auth/tests/utils/testAllActions';
import {
  TEST_ORG_FILTER,
  TEST_PRIVATE_FILTER,
  TEST_PUBLIC_FILTER
} from 'lib/services/auth/tests/utils/constants';

export default ({
  modelName,
  viewAllScopes,
  viewPublicScopes,
  editAllScopes,
  editPublicScopes,
}) => {
  describe(`model scope filters ${modelName}`, () => {
    setup();

    testAllActions(modelName, [SITE_ADMIN], TEST_ORG_FILTER);
    testAllActions(modelName, [ALL], TEST_ORG_FILTER);

    // org token tests
    testOrgScopeFilter(modelName, 'view', viewAllScopes, TEST_ORG_FILTER);
    testOrgScopeFilter(modelName, 'edit', viewAllScopes, TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'create', viewAllScopes, TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'delete', viewAllScopes, TEST_PRIVATE_FILTER);

    testOrgScopeFilter(modelName, 'view', viewPublicScopes, TEST_PUBLIC_FILTER);
    testOrgScopeFilter(modelName, 'edit', viewPublicScopes, TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'create', viewPublicScopes, TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'delete', viewPublicScopes, TEST_PRIVATE_FILTER);

    testOrgScopeFilter(modelName, 'view', editAllScopes, TEST_ORG_FILTER);
    testOrgScopeFilter(modelName, 'edit', editAllScopes, TEST_ORG_FILTER);
    testOrgScopeFilter(modelName, 'create', editAllScopes, TEST_ORG_FILTER);
    testOrgScopeFilter(modelName, 'delete', editAllScopes, TEST_ORG_FILTER);

    testOrgScopeFilter(modelName, 'view', editPublicScopes, TEST_PUBLIC_FILTER);
    testOrgScopeFilter(modelName, 'edit', editPublicScopes, TEST_PUBLIC_FILTER);
    testOrgScopeFilter(modelName, 'create', editPublicScopes, TEST_PUBLIC_FILTER);
    testOrgScopeFilter(modelName, 'delete', editPublicScopes, TEST_PUBLIC_FILTER);

    testOrgScopeFilter(modelName, 'view', [], TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'edit', [], TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'create', [], TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'delete', [], TEST_PRIVATE_FILTER);

    testOwnerScopeFilterError(modelName, 'view');
    testOwnerScopeFilterError(modelName, 'edit');
    testOwnerScopeFilterError(modelName, 'create');
    testOwnerScopeFilterError(modelName, 'delete');

    // Basic Client tests
    testClientBasicScopeFilter(modelName, 'view', viewAllScopes, TEST_ORG_FILTER);
    testClientBasicScopeFilter(modelName, 'view', editAllScopes, TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'view', []);

    testClientBasicScopeFilter(modelName, 'edit', editAllScopes, TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'edit', viewAllScopes);
    testClientBasicScopeFilterError(modelName, 'edit', []);

    testClientBasicScopeFilter(modelName, 'create', editAllScopes, TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'create', viewAllScopes);
    testClientBasicScopeFilterError(modelName, 'create', []);

    testClientBasicScopeFilter(modelName, 'delete', editAllScopes, TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'delete', viewAllScopes);
    testClientBasicScopeFilterError(modelName, 'delete', []);

    // site admin tests
    testSiteAdminScopeFilter(modelName, 'view', {});
    testSiteAdminScopeFilter(modelName, 'edit', {});
    testSiteAdminScopeFilter(modelName, 'create', {});
    testSiteAdminScopeFilter(modelName, 'delete', {});
  });
};
