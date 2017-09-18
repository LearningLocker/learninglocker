import includes from 'lodash/includes';
import get from 'lodash/get';
import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import getScopesFromAuthInfo from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import isOrgOwnerInAuthInfo from 'lib/services/auth/authInfoSelectors/isOrgOwnerInAuthInfo';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import NoAccessError from 'lib/errors/NoAccessError';

// DEPRICATED, use getShareableModelFilter
export default ({ editAllScope }) =>
  async ({ actionName, authInfo }) => {
    const scopes = getScopesFromAuthInfo(authInfo);

    if (includes(scopes, SITE_ADMIN)) return getOrgFilter(authInfo);
    if (get(authInfo, ['token', 'tokenType']) !== 'organisation') {
      throw new NoAccessError();
    }
    if (includes(scopes, ALL)) return getOrgFilter(authInfo);
    if (await isOrgOwnerInAuthInfo(authInfo)) return getOrgFilter(authInfo);

    switch (actionName) {
      case 'view':
        return getOrgFilter(authInfo);
      default: {
        if (includes(scopes, editAllScope)) return getOrgFilter(authInfo);
        throw new NoAccessError();
      }
    }
  };
