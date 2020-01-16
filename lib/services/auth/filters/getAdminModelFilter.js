import getScopesFromAuthInfo from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import NoAccessError from 'lib/errors/NoAccessError';
import getModelsFilter,
  {
    getSiteAdminFilter,
    checkAllowedTokenType,
    checkAllScope
  } from 'lib/services/auth/filters/utils/getModelsFilter';

/**
 * @param {string[]} _.viewAllScopes
 * @param {string[]} _.editAllScopes
 * @return {({ actionName, authInfo }) => Promise}
 */
const adminModelFilter = ({ viewAllScopes, editAllScopes }) =>
  async ({ actionName, authInfo }) => {
    const scopes = getScopesFromAuthInfo(authInfo);

    switch (actionName) {
      case 'view': {
        const hasValidViewScopes = [...viewAllScopes, ...editAllScopes].some(s => scopes.includes(s));
        if (hasValidViewScopes) return getOrgFilter(authInfo);
        throw new NoAccessError();
      }
      default: {
        const hasValidEditScopes = editAllScopes.some(s => scopes.includes(s));
        if (hasValidEditScopes) return getOrgFilter(authInfo);
        throw new NoAccessError();
      }
    }
  };

// -----------------------

const getAdminModelFilter = scopeConstants => getModelsFilter({
  ...scopeConstants,
  filters: [
    getSiteAdminFilter,
    checkAllowedTokenType,
    checkAllScope,
    adminModelFilter
  ]
});

export default getAdminModelFilter;
