import get from 'lodash/get';
import getTokenTypeFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getTokenTypeFromAuthInfo';

export default (authInfo) => {
  const tokenId = get(authInfo, ['token', 'tokenId']);
  const tokenType = getTokenTypeFromAuthInfo(authInfo);
  if (tokenType === 'organisation') return tokenId;

  const tokenOrgId = get(authInfo, ['token', 'organisationId']);
  if (tokenOrgId) return tokenOrgId;

  const clientOrgId = get(authInfo, ['client', 'organisation']);
  if (clientOrgId) return clientOrgId;

  return null;
};
