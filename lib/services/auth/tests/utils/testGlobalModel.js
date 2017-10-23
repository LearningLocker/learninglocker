import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import setup from 'lib/services/auth/tests/utils/setup';
import testOrgScopeFilter
  from 'lib/services/auth/tests/utils/testOrgScopeFilter';
import testOrgScopeFilterError
  from 'lib/services/auth/tests/utils/testOrgScopeFilterError';
import testClientBasicScopeFilter
  from 'lib/services/auth/tests/utils/testClientBasicScopeFilter';
import testClientBasicScopeFilterError
  from 'lib/services/auth/tests/utils/testClientBasicScopeFilterError';
import testOrgScopeFilterOwnerError
  from 'lib/services/auth/tests/utils/testOrgScopeFilterOwnerError';
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

    // org token tests
    testOrgScopeFilter(modelName, 'view', [], TEST_ORG_FILTER);
    testOrgScopeFilterError(modelName, 'edit', []);
    testOrgScopeFilterError(modelName, 'create', []);
    testOrgScopeFilterError(modelName, 'delete', []);

    testOrgScopeFilterOwnerError(modelName, 'edit');
    testOrgScopeFilterOwnerError(modelName, 'create');
    testOrgScopeFilterOwnerError(modelName, 'delete');

    testOwnerScopeFilterError(modelName, 'view');
    testOwnerScopeFilterError(modelName, 'edit');
    testOwnerScopeFilterError(modelName, 'create');
    testOwnerScopeFilterError(modelName, 'delete');

    // basic client tests
    testClientBasicScopeFilter(modelName, 'view', [ALL], TEST_ORG_FILTER);
    testClientBasicScopeFilter(modelName, 'view', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'view', []);

    testClientBasicScopeFilter(modelName, 'edit', [ALL], TEST_ORG_FILTER);
    testClientBasicScopeFilter(modelName, 'edit', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'edit', []);

    testClientBasicScopeFilter(modelName, 'create', [ALL], TEST_ORG_FILTER);
    testClientBasicScopeFilter(modelName, 'create', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'create', []);

    testClientBasicScopeFilter(modelName, 'delete', [ALL], TEST_ORG_FILTER);
    testClientBasicScopeFilter(modelName, 'delete', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'delete', []);

    // site admin tests
    testSiteAdminScopeFilter(modelName, 'view', {});
    testSiteAdminScopeFilter(modelName, 'edit', {});
    testSiteAdminScopeFilter(modelName, 'create', {});
    testSiteAdminScopeFilter(modelName, 'delete', {});
  });
};
