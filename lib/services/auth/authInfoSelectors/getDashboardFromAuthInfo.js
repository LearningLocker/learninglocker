import get from 'lodash/get';
import getTokenTypeFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getTokenTypeFromAuthInfo';

export default (authInfo) => {
  const clientOrgId = get(authInfo, ['client', 'dashboard']);
  if (clientOrgId) return clientOrgId;

  const tokenId = get(authInfo, ['token', 'tokenId']);
  const tokenType = getTokenTypeFromAuthInfo(authInfo);
  if (tokenType === 'dashboard') return tokenId;

  return null;
};
