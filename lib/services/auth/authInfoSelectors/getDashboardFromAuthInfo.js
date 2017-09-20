import get from 'lodash/get';

export default (authInfo) => {
  const clientOrgId = get(authInfo, ['client', 'dashboard']);
  if (clientOrgId) return clientOrgId;

  const tokenId = get(authInfo, ['token', 'tokenId']);
  const tokenType = get(authInfo, ['token', 'tokenType']);
  if (tokenType === 'dashboard') return tokenId;

  return null;
};
