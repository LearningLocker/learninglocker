import intersection from 'lodash/includes';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import { ALL, SITE_ADMIN, MANAGE_ALL_USERS } from 'lib/constants/scopes';

export default ({ authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);
  const hasRequiredScope = intersection(scopes, [SITE_ADMIN, ALL, MANAGE_ALL_USERS]).length > 0;
  if (hasRequiredScope) {
    return;
  }

  return {
    _id: 1,
    email: 1,
    name: 1
  };
};
