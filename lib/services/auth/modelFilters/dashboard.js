import {
  VIEW_PUBLIC_DASHBOARDS,
  EDIT_PUBLIC_DASHBOARDS,
  VIEW_ALL_DASHBOARDS,
  EDIT_ALL_DASHBOARDS,
} from 'lib/constants/orgScopes';
import includes from 'lodash/includes';
import { ALL } from 'lib/constants/scopes';
import { shareableModelFilter }
  from 'lib/services/auth/filters/getShareableModelFilter';
import mongoose from 'mongoose';
import getDashboardFromAuthInfo from
  'lib/services/auth/authInfoSelectors/getDashboardFromAuthInfo';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import NoAccessError from 'lib/errors/NoAccessError';
import get from 'lodash/get';
import getModelsFilter,
  {
    getSiteAdminFilter,
    checkAllowedTokenType,
    checkAllScope
  } from 'lib/services/auth/filters/utils/getModelsFilter';

const objectId = mongoose.Types.ObjectId;

const getDashboardFilter = () => ({ actionName, authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);
  const tokenType = get(authInfo, ['token', 'tokenType']);

  if (tokenType === 'dashboard') {
    // deny all requests that are not to view or where we don't have the ALL scope
    if (actionName !== 'view' || !includes(scopes, ALL)) {
      throw new NoAccessError();
    }

    const dashboardId = getDashboardFromAuthInfo(authInfo);
    return { _id: objectId(dashboardId) };
  }
};

export const filters = [
  getSiteAdminFilter,
  checkAllowedTokenType,
  getDashboardFilter,
  checkAllScope,
  shareableModelFilter
];

export default getModelsFilter({
  viewAllScope: VIEW_ALL_DASHBOARDS,
  editAllScope: EDIT_ALL_DASHBOARDS,
  viewPublicScope: VIEW_PUBLIC_DASHBOARDS,
  editPublicScope: EDIT_PUBLIC_DASHBOARDS,
  allowedTokenTypes: ['organisation', 'dashboard', 'client'],
  filters
});
