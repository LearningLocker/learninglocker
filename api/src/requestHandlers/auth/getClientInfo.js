/**
 * Gets the current client info.
 * @param {Express.Request} req  The request
 * @param {Express.Response} res  The response object
 * @return {Promise<void>} HTTP 200 OK on success
 */
export default async function getClientInfo(req, res) {
  const authInfo = req.user.authInfo || {};
  const { title, lrs_id, organisation, scopes } = authInfo.client;
  res.status(200).send({ title, organisation, lrs_id, scopes });
}
