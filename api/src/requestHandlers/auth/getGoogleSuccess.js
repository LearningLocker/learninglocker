import { AUTH_JWT_SUCCESS } from 'lib/constants/routes';
import { createUserJWT } from 'api/auth/jwt';

/**
 * Redirects to the Google API assuming the JWT is valid.
 * @param {Express.Request} req The request
 * @param {Express.Response} res The response object
 * @return {Promise<void>} HTTP 200 OK on success
 */
export async function getGoogleSuccess(req, res) {
  try {
    const token = await createUserJWT(req.user, 'google');
    res.redirect(`/api${AUTH_JWT_SUCCESS}?access_token=${token}`);
  } catch (err) {
    res.status(500).send(err);
  }
};
