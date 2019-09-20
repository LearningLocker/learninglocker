import getScopesFromAuthInfo from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import NoAccessError from 'lib/errors/NoAccessError';
import getModelsFilter,
  {
    getSiteAdminFilter,
    checkAllowedTokenType,
    checkAllScope
  } from 'lib/services/auth/filters/utils/getModelsFilter';

const globalModelFilter = ({ editAllScopes }) =>
  async ({ actionName, authInfo }) => {
    const scopes = getScopesFromAuthInfo(authInfo);

    const tokenType = authInfo.token.tokenType;
    switch (actionName) {
      case 'view': {
        switch (tokenType) {
          case 'organisation':
            return getOrgFilter(authInfo);
          default: {
            const isValid = editAllScopes.some(s => scopes.includes(s));
            if (isValid) return getOrgFilter(authInfo);
            throw new NoAccessError();
          }
        }
      }
      default: {
        const isValid = editAllScopes.some(s => scopes.includes(s));
        if (isValid) return getOrgFilter(authInfo);
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
    globalModelFilter
  ]
});
