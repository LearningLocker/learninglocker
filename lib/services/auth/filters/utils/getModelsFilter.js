import includes from 'lodash/includes';
import some from 'lodash/some';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import getTokenTypeFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getTokenTypeFromAuthInfo';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import NoAccessError from 'lib/errors/NoAccessError';
import { getConnection } from 'lib/connections/mongoose';
import { reduce } from 'bluebird';
import moment from 'moment';

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

export const checkOrganisationExpirery = () => async ({ authInfo }) => {
  const orgFilter = getOrgFilter(authInfo);
  const { organisation } = orgFilter;

  const Organisation = getConnection().model('Organisation');
  const org = await Organisation.findById(organisation);

  // if we're a site admin, we can do anything
  if (some(getScopesFromAuthInfo(authInfo), item => item === SITE_ADMIN)) {
    return;
  }

  if (org && org.expiration && moment(org.expiration).isBefore(moment())) {
    throw new NoAccessError();
  }
};

export default scopeConstants => async (options) => {
  const { filters: filters2 } = scopeConstants;
  const filters = [checkOrganisationExpirery, ...filters2];

  const toReturn = reduce(filters, async (result, item) => {
    if (result) {
      return result;
    }

    const out = await item(scopeConstants)(options);

    return out;
  }, null);

  return toReturn;
};
