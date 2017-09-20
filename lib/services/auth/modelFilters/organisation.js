import includes from 'lodash/includes';
import get from 'lodash/get';
import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import { MANAGE_ALL_ORGANISATIONS } from 'lib/constants/orgScopes';
import getScopesFromAuthInfo from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import isOrgOwnerInAuthInfo from 'lib/services/auth/authInfoSelectors/isOrgOwnerInAuthInfo';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import NoAccessError from 'lib/errors/NoAccessError';

const getUserOrgsFilter = (authInfo) => {
  const userOrgs = get(authInfo, ['user', 'organisations'], []);
  const filter = { _id: { $in: userOrgs } };
  return filter;
};

export default async ({ actionName, authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);

  if (includes(scopes, SITE_ADMIN)) return {};
  if (includes(scopes, ALL)) return getUserOrgsFilter(authInfo);
  if (await isOrgOwnerInAuthInfo(authInfo)) return getUserOrgsFilter(authInfo);

  switch (actionName) {
    case 'view': {
      const filter = getUserOrgsFilter(authInfo);
      return filter;
    }
    case 'edit': {
      if (includes(scopes, MANAGE_ALL_ORGANISATIONS)) return getOrgFilter(authInfo);
      throw new NoAccessError();
    }
    default: {
      throw new NoAccessError();
    }
  }
};
