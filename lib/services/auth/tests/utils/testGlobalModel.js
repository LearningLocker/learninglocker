import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import setup from 'lib/services/auth/tests/utils/setup';
import testOrgScopeFilter
  from 'lib/services/auth/tests/utils/testOrgScopeFilter';
import testOrgScopeFilterError
  from 'lib/services/auth/tests/utils/testOrgScopeFilterError';
import testOrgScopeFilterOwner
  from 'lib/services/auth/tests/utils/testOrgScopeFilterOwner';
import testOwnerScopeFilterError
  from 'lib/services/auth/tests/utils/testOwnerScopeFilterError';
import testSiteAdminScopeFilter
  from 'lib/services/auth/tests/utils/testSiteAdminScopeFilter';
import testAllActions from 'lib/services/auth/tests/utils/testAllActions';
import { TEST_ORG_FILTER } from 'lib/services/auth/tests/utils/constants';

export default ({ modelName, editAllScope }) => {
  describe(`model scope filters ${modelName}`, () => {
    setup();

    testAllActions(modelName, [SITE_ADMIN], TEST_ORG_FILTER);
    testAllActions(modelName, [ALL], TEST_ORG_FILTER);
    testAllActions(modelName, [editAllScope], TEST_ORG_FILTER);

    testOrgScopeFilter(modelName, 'view', [], TEST_ORG_FILTER);
    testOrgScopeFilterError(modelName, 'edit', []);
    testOrgScopeFilterError(modelName, 'create', []);
    testOrgScopeFilterError(modelName, 'delete', []);

    testOrgScopeFilterOwner(modelName, 'view', TEST_ORG_FILTER);
    testOrgScopeFilterOwner(modelName, 'edit', TEST_ORG_FILTER);
    testOrgScopeFilterOwner(modelName, 'create', TEST_ORG_FILTER);
    testOrgScopeFilterOwner(modelName, 'delete', TEST_ORG_FILTER);

    testOwnerScopeFilterError(modelName, 'view');
    testOwnerScopeFilterError(modelName, 'edit');
    testOwnerScopeFilterError(modelName, 'create');
    testOwnerScopeFilterError(modelName, 'delete');

    testSiteAdminScopeFilter(modelName, 'view', {});
    testSiteAdminScopeFilter(modelName, 'edit', {});
    testSiteAdminScopeFilter(modelName, 'create', {});
    testSiteAdminScopeFilter(modelName, 'delete', {});
  });
};
