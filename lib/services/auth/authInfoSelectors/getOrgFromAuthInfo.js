import get from 'lodash/get';
import getTokenTypeFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getTokenTypeFromAuthInfo';

export default (authInfo) => {
  const tokenId = get(authInfo, ['token', 'tokenId']);
  const tokenType = getTokenTypeFromAuthInfo(authInfo);
  if (
    tokenType === 'organisation' ||
    tokenType === 'worker'
  ) {
    return tokenId;
  }

  const tokenOrgId = get(authInfo, ['token', 'organisationId']);
  if (tokenOrgId) return tokenOrgId;

  const clientOrgId = get(authInfo, ['client', 'organisation']);
  if (clientOrgId) return clientOrgId;

  const dashboardOrgId = get(authInfo, ['token', 'organisation']);
  if (dashboardOrgId) return dashboardOrgId;

  return null;
};
