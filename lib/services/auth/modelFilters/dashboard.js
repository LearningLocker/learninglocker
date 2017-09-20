import {
  VIEW_PUBLIC_DASHBOARDS,
  EDIT_PUBLIC_DASHBOARDS,
  VIEW_ALL_DASHBOARDS,
  EDIT_ALL_DASHBOARDS,
} from 'lib/constants/orgScopes';
import includes from 'lodash/includes';
import { ALL } from 'lib/constants/scopes';
import getShareableModelFilter, { defaultFilters }
  from 'lib/services/auth/filters/getShareableModelFilter';
import mongoose from 'mongoose';
import getDashboardFromAuthInfo from
  'lib/services/auth/authInfoSelectors/getDashboardFromAuthInfo';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import get from 'lodash/get';

const objectId = mongoose.Types.ObjectId;

const getDashboardFilter = () => ({ actionName, authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);

  if (
    actionName === 'view' &&
    includes(scopes, ALL) &&
    get(authInfo, ['token', 'tokenType']) === 'dashboard'
  ) {
    const dashboardId = getDashboardFromAuthInfo(authInfo);
    return { _id: objectId(dashboardId) };
  }
};

export default getShareableModelFilter({
  viewAllScope: VIEW_ALL_DASHBOARDS,
  editAllScope: EDIT_ALL_DASHBOARDS,
  viewPublicScope: VIEW_PUBLIC_DASHBOARDS,
  editPublicScope: EDIT_PUBLIC_DASHBOARDS,
  allowedTokenTypes: ['organisation', 'dashboard'],
  filters: [...defaultFilters.slice(0, 2), getDashboardFilter, ...defaultFilters.slice(2)]
});

