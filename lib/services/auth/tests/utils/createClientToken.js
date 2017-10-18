export default (scopes = []) => ({
  tokenType: 'client',
  provider: 'native',
  scopes,
});
