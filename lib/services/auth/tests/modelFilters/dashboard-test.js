import testShareableModel from 'lib/services/auth/tests/utils/testShareableModel';
import {
  VIEW_PUBLIC_DASHBOARDS,
  EDIT_PUBLIC_DASHBOARDS,
  VIEW_ALL_DASHBOARDS,
  EDIT_ALL_DASHBOARDS,
} from 'lib/constants/orgScopes';
import { VIEW_SHAREABLE_DASHBOARD } from 'lib/constants/scopes';
import { TEST_DASH_DASHBOARD_FILTER } from 'lib/services/auth/tests/utils/constants';
import testDashScopeFilter
  from 'lib/services/auth/tests/utils/testDashScopeFilter';

describe('dashboard-test', () => {
  testShareableModel({
    modelName: 'dashboard',
    viewAllScope: VIEW_ALL_DASHBOARDS,
    editAllScope: EDIT_ALL_DASHBOARDS,
    viewPublicScope: VIEW_PUBLIC_DASHBOARDS,
    editPublicScope: EDIT_PUBLIC_DASHBOARDS,
  });

  testDashScopeFilter('dashboard', 'view', [VIEW_SHAREABLE_DASHBOARD], TEST_DASH_DASHBOARD_FILTER);
});
