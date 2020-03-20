import testShareableModel from 'lib/services/auth/tests/utils/testShareableModel';
import 'lib/models/dashboard';

import {
  VIEW_PUBLIC_VISUALISATIONS,
  EDIT_PUBLIC_VISUALISATIONS,
  VIEW_ALL_VISUALISATIONS,
  EDIT_ALL_VISUALISATIONS,
} from 'lib/constants/orgScopes';
import { VIEW_SHAREABLE_DASHBOARD } from 'lib/constants/scopes';
import { TEST_DASH_FILTER } from 'lib/services/auth/tests/utils/constants';
import testDashScopeFilter
  from 'lib/services/auth/tests/utils/testDashScopeFilter';

describe('test visualisation model', () => {
  testShareableModel({
    modelName: 'visualisation',
    viewAllScopes: [VIEW_ALL_VISUALISATIONS],
    editAllScopes: [EDIT_ALL_VISUALISATIONS],
    viewPublicScopes: [VIEW_PUBLIC_VISUALISATIONS],
    editPublicScopes: [EDIT_PUBLIC_VISUALISATIONS],
  });

  testDashScopeFilter('visualisation', 'view', [VIEW_SHAREABLE_DASHBOARD], TEST_DASH_FILTER);
});
