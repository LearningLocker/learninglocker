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
  viewAllScope,
  viewPublicScope,
  editAllScope,
  editPublicScope
}) => {
  describe(`model scope filters ${modelName}`, () => {
    setup();

    testAllActions(modelName, [SITE_ADMIN], TEST_ORG_FILTER);
    testAllActions(modelName, [ALL], TEST_ORG_FILTER);

    // org token tests
    testOrgScopeFilter(modelName, 'view', [viewAllScope], TEST_ORG_FILTER);
    testOrgScopeFilter(modelName, 'edit', [viewAllScope], TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'create', [viewAllScope], TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'delete', [viewAllScope], TEST_PRIVATE_FILTER);

    testOrgScopeFilter(modelName, 'view', [viewPublicScope], TEST_PUBLIC_FILTER);
    testOrgScopeFilter(modelName, 'edit', [viewPublicScope], TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'create', [viewPublicScope], TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'delete', [viewPublicScope], TEST_PRIVATE_FILTER);

    testOrgScopeFilter(modelName, 'view', [editAllScope], TEST_ORG_FILTER);
    testOrgScopeFilter(modelName, 'edit', [editAllScope], TEST_ORG_FILTER);
    testOrgScopeFilter(modelName, 'create', [editAllScope], TEST_ORG_FILTER);
    testOrgScopeFilter(modelName, 'delete', [editAllScope], TEST_ORG_FILTER);

    testOrgScopeFilter(modelName, 'view', [editPublicScope], TEST_PUBLIC_FILTER);
    testOrgScopeFilter(modelName, 'edit', [editPublicScope], TEST_PUBLIC_FILTER);
    testOrgScopeFilter(modelName, 'create', [editPublicScope], TEST_PUBLIC_FILTER);
    testOrgScopeFilter(modelName, 'delete', [editPublicScope], TEST_PUBLIC_FILTER);

    testOrgScopeFilter(modelName, 'view', [], TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'edit', [], TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'create', [], TEST_PRIVATE_FILTER);
    testOrgScopeFilter(modelName, 'delete', [], TEST_PRIVATE_FILTER);

    testOwnerScopeFilterError(modelName, 'view');
    testOwnerScopeFilterError(modelName, 'edit');
    testOwnerScopeFilterError(modelName, 'create');
    testOwnerScopeFilterError(modelName, 'delete');

    // Basic Client tests
    testClientBasicScopeFilter(modelName, 'view', [viewAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilter(modelName, 'view', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'view', []);

    testClientBasicScopeFilter(modelName, 'edit', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'edit', [viewAllScope]);
    testClientBasicScopeFilterError(modelName, 'edit', []);

    testClientBasicScopeFilter(modelName, 'create', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'create', [viewAllScope]);
    testClientBasicScopeFilterError(modelName, 'create', []);

    testClientBasicScopeFilter(modelName, 'delete', [editAllScope], TEST_ORG_FILTER);
    testClientBasicScopeFilterError(modelName, 'delete', [viewAllScope]);
    testClientBasicScopeFilterError(modelName, 'delete', []);

    // site admin tests
    testSiteAdminScopeFilter(modelName, 'view', {});
    testSiteAdminScopeFilter(modelName, 'edit', {});
    testSiteAdminScopeFilter(modelName, 'create', {});
    testSiteAdminScopeFilter(modelName, 'delete', {});
  });
};
