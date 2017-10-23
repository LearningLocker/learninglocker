import {
  VIEW_PUBLIC_VISUALISATIONS,
  EDIT_PUBLIC_VISUALISATIONS,
  VIEW_ALL_VISUALISATIONS,
  EDIT_ALL_VISUALISATIONS,
} from 'lib/constants/orgScopes';
import { shareableModelFilter }
  from 'lib/services/auth/filters/getShareableModelFilter';
import { VIEW_SHAREABLE_DASHBOARD } from 'lib/constants/scopes';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getTokenTypeFromAuthInfo
    from 'lib/services/auth/authInfoSelectors/getTokenTypeFromAuthInfo';
import includes from 'lodash/includes';
import getDashboardFromAuthInfo from
  'lib/services/auth/authInfoSelectors/getDashboardFromAuthInfo';
import mongoose from 'mongoose';
import Dashboard from 'lib/models/dashboard';
import map from 'lodash/map';
import NoAccessError from 'lib/errors/NoAccessError';
import getModelsFilter,
  {
    getSiteAdminFilter,
    checkAllowedTokenType,
    checkAllScope
  } from 'lib/services/auth/filters/utils/getModelsFilter';

const objectId = mongoose.Types.ObjectId;


const getDashboardFilter = () => async ({ actionName, authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);
  const tokenType = getTokenTypeFromAuthInfo(authInfo);

  if (tokenType === 'dashboard') {
    if (actionName !== 'view' || !includes(scopes, VIEW_SHAREABLE_DASHBOARD)) {
      throw new NoAccessError();
    }

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

const filters = [
  getSiteAdminFilter,
  checkAllowedTokenType,
  getDashboardFilter,
  checkAllScope,
  shareableModelFilter
];

export default getModelsFilter({
  viewAllScope: VIEW_ALL_VISUALISATIONS,
  editAllScope: EDIT_ALL_VISUALISATIONS,
  viewPublicScope: VIEW_PUBLIC_VISUALISATIONS,
  editPublicScope: EDIT_PUBLIC_VISUALISATIONS,
  allowedTokenTypes: ['organisation', 'dashboard', 'client'],
  filters
});
