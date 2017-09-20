import includes from 'lodash/includes';
import get from 'lodash/get';
import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import isOrgOwnerInAuthInfo
  from 'lib/services/auth/authInfoSelectors/isOrgOwnerInAuthInfo';
import getPublicOrgFilter from 'lib/services/auth/filters/getPublicOrgFilter';
import getPrivateOrgFilter from 'lib/services/auth/filters/getPrivateOrgFilter';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import NoAccessError from 'lib/errors/NoAccessError';
import { reduce } from 'bluebird';

export const getSiteAdminFilter = () => ({ authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);
  if (includes(scopes, SITE_ADMIN)) {
    return getOrgFilter(authInfo);
  }
};

export const checkAllowedTokenType =
  ({ allowedTokenTypes = ['organisation'] }) => ({ authInfo }) => {
    const tokenType = get(authInfo, ['token', 'tokenType']);
    if (
      !includes(allowedTokenTypes, tokenType)
    ) {
      throw new NoAccessError();
    }
  };

export const globalModelFilter = ({
  viewAllScope,
  viewPublicScope,
  editAllScope,
  editPublicScope
}) => async ({ actionName, authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);

  if (includes(scopes, ALL)) {
    return getOrgFilter(authInfo);
  }
  if (await isOrgOwnerInAuthInfo(authInfo)) return getOrgFilter(authInfo);

  switch (actionName) {
    case 'view': {
      if (includes(scopes, viewAllScope)) {
        return getOrgFilter(authInfo);
      }
      if (includes(scopes, viewPublicScope)) {
        return getPublicOrgFilter(authInfo);
      }

      return getPrivateOrgFilter(authInfo);
    }
    default: {
      if (includes(scopes, editAllScope)) {
        return getOrgFilter(authInfo);
      }
      if (includes(scopes, editPublicScope)) {
        return getPublicOrgFilter(authInfo);
      }
      return getPrivateOrgFilter(authInfo);
    }
  }
};

export const defaultFilters = [
  getSiteAdminFilter,
  checkAllowedTokenType,
  globalModelFilter
];

export default scopeConstants => async (options) => {
  const { filters = defaultFilters } = scopeConstants;

  return reduce(filters, async (result, item) => {
    if (result) {
      return result;
    }

    const out = await item(scopeConstants)(options);

    return out;
  }, null);
};
