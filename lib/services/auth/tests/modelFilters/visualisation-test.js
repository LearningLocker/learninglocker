import testShareableModel from 'lib/services/auth/tests/utils/testShareableModel';
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
    viewAllScope: VIEW_ALL_VISUALISATIONS,
    editAllScope: EDIT_ALL_VISUALISATIONS,
    viewPublicScope: VIEW_PUBLIC_VISUALISATIONS,
    editPublicScope: EDIT_PUBLIC_VISUALISATIONS,
  });

  testDashScopeFilter('visualisation', 'view', [VIEW_SHAREABLE_DASHBOARD], TEST_DASH_FILTER);
});
