import includes from 'lodash/includes';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
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
  ({ allowedTokenTypes = ['organisation', 'client'] }) => ({ authInfo }) => {
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

  // Organisation owners shouldn't necaserraly have access.
  // if (await isOrgOwnerInAuthInfo(authInfo)) return getOrgFilter(authInfo);

  switch (actionName) {
    case 'view': {
      if (includes(scopes, viewAllScope)) {
        return getOrgFilter(authInfo);
      }
      if (includes(scopes, viewPublicScope)) {
        return getPublicOrgFilter(authInfo);
      }

      const privateFilter = getPrivateOrgFilter(authInfo);
      if (isEmpty(privateFilter)) {
        throw new NoAccessError();
      }

      return privateFilter;
    }
    default: {
      if (includes(scopes, editAllScope)) {
        return getOrgFilter(authInfo);
      }
      if (includes(scopes, editPublicScope)) {
        return getPublicOrgFilter(authInfo);
      }
      const privateFilter = getPrivateOrgFilter(authInfo);
      if (isEmpty(privateFilter)) {
        throw new NoAccessError();
      }
      return privateFilter;
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
