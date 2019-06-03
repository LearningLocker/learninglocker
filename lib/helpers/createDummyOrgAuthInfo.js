export default (orgId, scopes = []) => ({
  token: {
    tokenType: 'organisation',
    tokenId: orgId.toString(),
    scopes,
  }
});
