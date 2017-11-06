import includes from 'lodash/includes';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import getTokenTypeFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getTokenTypeFromAuthInfo';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
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
    const tokenType = getTokenTypeFromAuthInfo(authInfo);
    if (
      !includes(allowedTokenTypes, tokenType)
    ) {
      throw new NoAccessError();
    }
  };

export const checkAllScope = () => ({ authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);

  if (includes(scopes, ALL)) {
    return getOrgFilter(authInfo);
  }
};

export default scopeConstants => async (options) => {
  const { filters } = scopeConstants;

  return reduce(filters, async (result, item) => {
    if (result) {
      return result;
    }

    const out = await item(scopeConstants)(options);

    return out;
  }, null);
};
