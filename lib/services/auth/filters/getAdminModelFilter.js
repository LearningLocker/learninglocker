import includes from 'lodash/includes';
import intersection from 'lodash/intersection';
import getScopesFromAuthInfo from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import NoAccessError from 'lib/errors/NoAccessError';
import getModelsFilter,
  {
    getSiteAdminFilter,
    checkAllowedTokenType,
    checkAllScope
  } from 'lib/services/auth/filters/utils/getModelsFilter';

const adminModelFilter = ({ viewAllScope, editAllScope }) =>
  async ({ actionName, authInfo }) => {
    const scopes = getScopesFromAuthInfo(authInfo);

    switch (actionName) {
      case 'view': {
        const validScopes = intersection(scopes, [viewAllScope, editAllScope]);
        if (validScopes.length > 0) return getOrgFilter(authInfo);
        throw new NoAccessError();
      }
      default: {
        if (includes(scopes, editAllScope)) return getOrgFilter(authInfo);
        throw new NoAccessError();
      }
    }
  };

// -----------------------

export default scopeConstants => getModelsFilter({
  ...scopeConstants,
  filters: [
    getSiteAdminFilter,
    checkAllowedTokenType,
    checkAllScope,
    adminModelFilter
  ]
});
