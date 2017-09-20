import {
  VIEW_PUBLIC_VISUALISATIONS,
  EDIT_PUBLIC_VISUALISATIONS,
  VIEW_ALL_VISUALISATIONS,
  EDIT_ALL_VISUALISATIONS,
} from 'lib/constants/orgScopes';
import getShareableModelFilter, { defaultFilters } from 'lib/services/auth/filters/getShareableModelFilter';
import { ALL } from 'lib/constants/scopes';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import get from 'lodash/get';
import includes from 'lodash/includes';
import getDashboardFromAuthInfo from
  'lib/services/auth/authInfoSelectors/getDashboardFromAuthInfo';
import mongoose from 'mongoose';
import Dashboard from 'lib/models/dashboard';
import map from 'lodash/map';

const objectId = mongoose.Types.ObjectId;


const getDashboardFilter = () => async ({ actionName, authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);

  if (
    actionName === 'view' &&
    includes(scopes, ALL) &&
    get(authInfo, ['token', 'tokenType']) === 'dashboard'
  ) {
    const dashboardId = getDashboardFromAuthInfo(authInfo);

    const dashboards = await Dashboard.aggregate([
      { $match: { _id: objectId(dashboardId) } },
      { $unwind: '$widgets' },
      { $project: {
        _id: 0,
        visualisationId: '$widgets.visualisation'
      } }
    ]);

    return { _id: { $in: map(dashboards, item => objectId(item.visualisationId)) } };
  }
};

export default getShareableModelFilter({
  viewAllScope: VIEW_ALL_VISUALISATIONS,
  editAllScope: EDIT_ALL_VISUALISATIONS,
  viewPublicScope: VIEW_PUBLIC_VISUALISATIONS,
  editPublicScope: EDIT_PUBLIC_VISUALISATIONS,
  allowedTokenTypes: ['organisation', 'dashboard'],
  filters: [...defaultFilters.slice(0, 2), getDashboardFilter, ...defaultFilters.slice(2)]
});
