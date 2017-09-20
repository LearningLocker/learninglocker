import mongoose from 'mongoose';
import includes from 'lodash/includes';
import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import { MANAGE_ALL_USERS } from 'lib/constants/orgScopes';
import getUserIdFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getUserIdFromAuthInfo';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import isOrgOwnerInAuthInfo
  from 'lib/services/auth/authInfoSelectors/isOrgOwnerInAuthInfo';
import NoAccessError from 'lib/errors/NoAccessError';

const objectId = mongoose.Types.ObjectId;

const getUserFilter = (authInfo) => {
  const userId = objectId(getUserIdFromAuthInfo(authInfo));
  return { _id: userId };
};

const getOrgsFilter = (authInfo) => {
  const scopes = getScopesFromAuthInfo(authInfo);
  const orgId = getOrgFromAuthInfo(authInfo);
  const isSiteAdmin = includes(scopes, SITE_ADMIN);
  if (isSiteAdmin && !orgId) return {};
  return { organisations: objectId(orgId) };
};

export default async ({ actionName, authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);

  if (includes(scopes, SITE_ADMIN)) return getOrgsFilter(authInfo);
  if (includes(scopes, ALL)) return getOrgsFilter(authInfo);
  if (await isOrgOwnerInAuthInfo(authInfo)) return getOrgsFilter(authInfo);

  switch (actionName) {
    case 'view':
      if (authInfo.token.tokenType === 'user') return getUserFilter(authInfo);
      return getOrgsFilter(authInfo);
    case 'edit': {
      if (includes(scopes, MANAGE_ALL_USERS)) return getOrgsFilter(authInfo);
      return getUserFilter(authInfo);
    }
    default: {
      throw new NoAccessError();
    }
  }
};
