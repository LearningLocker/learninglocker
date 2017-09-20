import get from 'lodash/get';

export default (authInfo) => {
  const tokenScopes = get(authInfo, ['token', 'scopes']);
  if (tokenScopes) return tokenScopes;

  const clientScopes = get(authInfo, ['client', 'scopes']);
  if (clientScopes) return clientScopes;

  return [];
};
