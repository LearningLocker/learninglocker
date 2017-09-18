export default function (req) {
  return req.user.authInfo || {};
}
