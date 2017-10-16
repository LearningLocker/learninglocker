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

const globalModelFilter = ({ editAllScope }) =>
  async ({ actionName, authInfo }) => {
    const scopes = getScopesFromAuthInfo(authInfo);

    switch (actionName) {
      case 'view':
        return getOrgFilter(authInfo);
      default: {
        if (includes(scopes, editAllScope)) return getOrgFilter(authInfo);
        throw new NoAccessError();
      }
    }
  };

// -----------------------

export default getModelsFilter({
  filters: [
    getSiteAdminFilter,
    checkAllowedTokenType,
    checkAllScope,
    globalModelFilter
  ]
});
