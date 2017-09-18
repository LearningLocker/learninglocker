export default (userObjId, scopes = []) => {
  const userId = userObjId.toString();
  return {
    userId,
    provider: 'native',
    scopes,
    tokenType: 'user',
    tokenId: userId,
  };
};
