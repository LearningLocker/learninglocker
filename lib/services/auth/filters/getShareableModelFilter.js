import includes from 'lodash/includes';
import intersection from 'lodash/intersection';
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
  viewPublicScope,
  editAllScopes,
  editPublicScope
}) => async ({ actionName, authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);

  switch (actionName) {
    case 'view': {
      const validAllScopes = intersection(scopes, [...viewAllScopes, ...editAllScopes]);
      if (validAllScopes.length > 0) {
        return getOrgFilter(authInfo);
      }

      const validPublicScopes = intersection(scopes, [viewPublicScope, editPublicScope]);
      if (validPublicScopes.length > 0) {
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
      if (includes(scopes, editPublicScope)) {
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
