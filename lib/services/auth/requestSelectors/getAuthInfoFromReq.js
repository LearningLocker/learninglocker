export default req =>
  (req.user && req.user.authInfo) || {};
