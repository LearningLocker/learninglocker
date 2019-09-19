import intersection from 'lodash/intersection';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import { MANAGE_ALL_USERS } from 'lib/constants/orgScopes';

export const SELECT = {
  _id: 1,
  email: 1,
  name: 1,
  organisations: 1,
};

export const MANAGER_SELECT = {
  _id: 1,
  name: 1,
  email: 1,
  ownerOrganisation: 1,
  organisations: 1,
  organisationSettings: 1,
  ownerOrganisationSettings: 1,
  scopes: 1,
  createdAt: 1,
  updatedAt: 1,
  verified: 1,
};

export default ({ authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);
  const hasRequiredScope = intersection(scopes, [SITE_ADMIN, ALL, MANAGE_ALL_USERS]).length > 0;
  if (hasRequiredScope) {
    return MANAGER_SELECT;
  }

  return SELECT;
};
