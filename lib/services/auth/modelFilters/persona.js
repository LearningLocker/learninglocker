import getScopesFromAuthInfo from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import NoAccessError from 'lib/errors/NoAccessError';
import {
  MANAGE_ALL_PERSONAS
} from 'lib/constants/orgScopes';
import { VIEW_SHAREABLE_DASHBOARD } from 'lib/constants/scopes';

import getModelsFilter,
{
  getSiteAdminFilter,
  checkAllowedTokenType,
  checkAllScope
} from 'lib/services/auth/filters/utils/getModelsFilter';

const globalModelFilter = ({ viewAllScopes, editAllScopes }) =>
  async ({ actionName, authInfo }) => {
    const scopes = getScopesFromAuthInfo(authInfo);

    const tokenType = authInfo.token.tokenType;
    switch (actionName) {
      case 'view': {
        switch (tokenType) {
          case 'organisation':
            return getOrgFilter(authInfo);
          default: {
            const isValid = [...viewAllScopes, ...editAllScopes].some(s => scopes.includes(s));
            if (isValid) return getOrgFilter(authInfo);
            throw new NoAccessError();
          }
        }
      }
      default: {
        const isValid = [...viewAllScopes, ...editAllScopes].some(s => scopes.includes(s));
        if (isValid) return getOrgFilter(authInfo);
        throw new NoAccessError();
      }
    }
  };

export default getModelsFilter({
  viewAllScopes: [VIEW_SHAREABLE_DASHBOARD],
  editAllScopes: [MANAGE_ALL_PERSONAS],
  allowedTokenTypes: ['organisation', 'dashboard', 'client'],
  filters: [
    getSiteAdminFilter,
    checkAllowedTokenType,
    checkAllScope,
    globalModelFilter
  ]
});
