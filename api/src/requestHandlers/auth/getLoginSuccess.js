/**
 * We verify the login in the middleware of the Express Router.
 * @param {Express.Request} req The request
 * @param {Express.Response} res The response object
 * @return {Promise<void>} HTTP 200 OK on success
 */
export async function getLoginSuccess(req, res) {
  res.send('Login success!');
};
