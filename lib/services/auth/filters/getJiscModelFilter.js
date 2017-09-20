import includes from 'lodash/includes';
import intersection from 'lodash/intersection';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import NoAccessError from 'lib/errors/NoAccessError';
import { ALL, UDD_READ } from 'lib/constants/scopes';

const runScopeChecks = (authInfo, expectedScopes) => {
  const actualScopes = getScopesFromAuthInfo(authInfo);
  const hasAccess =
    includes(actualScopes, expectedScopes.SITE_ADMIN) ||
    intersection(expectedScopes, actualScopes).length > 0;
  if (hasAccess) return getOrgFilter(authInfo);
  throw new NoAccessError();
};

export default (scopes = []) => async ({ authInfo, actionName }) => {
  const actualReadScopes = [...scopes, UDD_READ, ALL];
  const actualWriteScopes = [...scopes, ALL];
  switch (actionName) {
    case 'view': {
      return runScopeChecks(authInfo, actualReadScopes);
    }
    default: {
      return runScopeChecks(authInfo, actualWriteScopes);
    }
  }
};
