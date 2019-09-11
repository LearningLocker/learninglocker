import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getPublicOrgFilter from 'lib/services/auth/filters/getPublicOrgFilter';
import getPrivateOrgFilter from 'lib/services/auth/filters/getPrivateOrgFilter';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import NoAccessError from 'lib/errors/NoAccessError';
import getModelsFilter,
  {
    getSiteAdminFilter,
    checkAllowedTokenType,
    checkAllScope
  } from 'lib/services/auth/filters/utils/getModelsFilter';


export const shareableModelFilter = ({
  viewAllScopes,
  viewPublicScopes,
  editAllScopes,
  editPublicScopes,
}) => async ({ actionName, authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);

  switch (actionName) {
    case 'view': {
      const hasValidAllScopes = [...viewAllScopes, ...editAllScopes].some(s => scopes.includes(s));
      if (hasValidAllScopes) {
        return getOrgFilter(authInfo);
      }

      const hasValidPublicScopes = [...viewPublicScopes, ...editPublicScopes].some(s => scopes.includes(s));
      if (hasValidPublicScopes) {
        return getPublicOrgFilter(authInfo);
      }

      const privateFilter = getPrivateOrgFilter(authInfo);
      if (!privateFilter) {
        throw new NoAccessError();
      }

      return privateFilter;
    }
    default: {
      if (editAllScopes.some(s => scopes.includes(s))) {
        return getOrgFilter(authInfo);
      }
      if (editPublicScopes.some(s => scopes.includes(s))) {
        return getPublicOrgFilter(authInfo);
      }
      const privateFilter = getPrivateOrgFilter(authInfo);
      if (!privateFilter) {
        throw new NoAccessError();
      }

      return privateFilter;
    }
  }
};

export const filters = [
  getSiteAdminFilter,
  checkAllowedTokenType,
  checkAllScope,
  shareableModelFilter
];

export default scopeConstants => getModelsFilter({
  ...scopeConstants,
  filters
});
