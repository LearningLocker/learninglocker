import { AUTH_JWT_SUCCESS } from 'lib/constants/routes';
import logger from 'lib/logger';
import { createUserJWT } from 'api/auth/jwt';

/**
 * Redirects to the Google API assuming the JWT is valid.
 * @param {Express.Request} req The request
 * @param {Express.Response} res The response object
 * @return {Promise<void>} HTTP 200 OK on success
 */
export default async function getGoogleSuccess(req, res) {
  try {
    const token = await createUserJWT(req.user, 'google');
    res.redirect(`/api${AUTH_JWT_SUCCESS}?access_token=${token}`);
  } catch (err) {
    logger.error(err);
    res.status(500).send();
  }
}
