import intersection from 'lodash/intersection';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import { ALL, SITE_ADMIN, MANAGE_ALL_USERS } from 'lib/constants/scopes';

export const SELECT = {
  _id: 1,
  email: 1,
  name: 1,
  organisations: 1,
};

export const ALL_SELECT = {
  name: 1,
  email: 1,
  organisations: 1,
  organisationSettings: 1,
  imageUrl: 1,
  googleId: 1,
  ownerOrganisation: 1,
  settings: 1,
  scopes: 1,
  verified: 1,
  authLastAttempt: 1,
  authFailedAttempts: 1,
  authLockoutExpiry: 1,
  _id: 1,
  updatedAt: 1,
  createdAt: 1,
};

export default ({ authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);
  const hasRequiredScope = intersection(scopes, [SITE_ADMIN, ALL, MANAGE_ALL_USERS]).length > 0;
  if (hasRequiredScope) {
    return ALL_SELECT;
  }

  return SELECT;
};
