import intersection from 'lodash/intersection';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import { ALL, SITE_ADMIN, MANAGE_ALL_USERS } from 'lib/constants/scopes';

export const SELECT = {
  _id: 1,
  email: 1,
  name: 1,
  organisations: 1,
};

export default ({ authInfo }) => {
  const scopes = getScopesFromAuthInfo(authInfo);
  const hasRequiredScope = intersection(scopes, [SITE_ADMIN, ALL, MANAGE_ALL_USERS]).length > 0;
  if (hasRequiredScope) {
    return;
  }

  return SELECT;
};
