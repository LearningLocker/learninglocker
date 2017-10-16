import includes from 'lodash/includes';
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
  viewAllScope,
  viewPublicScope,
  editAllScope,
  editPublicScope
}) => async ({ actionName, authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);

  switch (actionName) {
    case 'view': {
      if (includes(scopes, viewAllScope)) {
        return getOrgFilter(authInfo);
      }
      if (includes(scopes, viewPublicScope)) {
        return getPublicOrgFilter(authInfo);
      }

      const privateFilter = getPrivateOrgFilter(authInfo);
      if (!privateFilter) {
        throw new NoAccessError();
      }

      return privateFilter;
    }
    default: {
      if (includes(scopes, editAllScope)) {
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
