import includes from 'lodash/includes';
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
        if (includes(scopes, viewAllScope)) return getOrgFilter(authInfo);
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
