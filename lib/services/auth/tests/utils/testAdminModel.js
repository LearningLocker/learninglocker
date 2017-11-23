import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import setup from 'lib/services/auth/tests/utils/setup';
import testOrgScopeFilter
  from 'lib/services/auth/tests/utils/testOrgScopeFilter';
import testOrgScopeFilterError
  from 'lib/services/auth/tests/utils/testOrgScopeFilterError';
import testOwnerScopeFilterError
  from 'lib/services/auth/tests/utils/testOwnerScopeFilterError';
import testClientBasicScopeFilter
  from 'lib/services/auth/tests/utils/testClientBasicScopeFilter';
import testClientBasicScopeFilterError
  from 'lib/services/auth/tests/utils/testClientBasicScopeFilterError';
import testSiteAdminScopeFilter
  from 'lib/services/auth/tests/utils/testSiteAdminScopeFilter';
import testAllActions from 'lib/services/auth/tests/utils/testAllActions';
import { TEST_ORG_FILTER } from 'lib/services/auth/tests/utils/constants';

export default ({ modelName, viewAllScope, editAllScope }) => {
  describe(`model scope filters ${modelName}`, () => {
    setup();

    testAllActions(modelName, [SITE_ADMIN], TEST_ORG_FILTER);
    testAllActions(modelName, [ALL], TEST_ORG_FILTER);

    // Org token tests
    testOrgScopeFilter(modelName, 'view', [viewAllScope], TEST_ORG_FILTER);
    testOrgScopeFilter(modelName, 'view', [editAllScope], TEST_ORG_FILTER);
    testOrgScopeFilterError(modelName, 'view', []);

    testOrgScopeFilter(modelName, 'edit', [editAllScope], TEST_ORG_FILTER);
    testOrgScopeFilterError(modelName, 'edit', []);

    testOrgScopeFilter(modelName, 'create', [editAllScope], TEST_ORG_FILTER);
    testOrgScopeFilterError(modelName, 'create', []);

    testOrgScopeFilter(modelName, 'delete', [editAllScope], TEST_ORG_FILTER);
    testOrgScopeFilterError(modelName, 'delete', []);

    testOwnerScopeFilterError(modelName, 'view');
    testOwnerScopeFilterError(modelName, 'edit');
    testOwnerScopeFilterError(modelName, 'create');
    testOwnerScopeFilterError(modelName, 'delete');

    // Basic Client tests
    testClientBasicScopeFilter(modelName, 'view', [viewAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilter(modelName, 'view', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'view', []);

    testClientBasicScopeFilter(modelName, 'edit', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'edit', []);

    testClientBasicScopeFilter(modelName, 'create', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'create', []);

    testClientBasicScopeFilter(modelName, 'delete', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'delete', []);

    // Site admin tests
    testSiteAdminScopeFilter(modelName, 'view', {});
    testSiteAdminScopeFilter(modelName, 'edit', {});
    testSiteAdminScopeFilter(modelName, 'create', {});
    testSiteAdminScopeFilter(modelName, 'delete', {});
  });
};
