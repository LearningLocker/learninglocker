import passport from 'passport';
import { v4 as uuid } from 'uuid';
import OAuthToken from 'lib/models/oAuthToken';
import { ACCESS_TOKEN_VALIDITY_PERIOD_SEC, DEFAULT_PASSPORT_OPTIONS } from 'lib/constants/auth';

/**
 * Requests an OAuth 2 token to provide a client with access to an organisation.
 * @param {Express.Request} req  The request
 * @param {Express.Response} res  The response object
 * @param {Function} next
 * @return {Promise<void>} HTTP 200 OK on success
 */
export async function postOAuth2TokenRequest(req, res) {
  passport.authenticate('OAuth2_Authorization', DEFAULT_PASSPORT_OPTIONS, (err, client) => {
    if (err) {
      if (err.isClientError) {
        res.status(400);
        res.send({ error: err.error });
        return;
      }
      res.status(500);
      res.send(err.error);
      return;
    }

    const accessToken = uuid();
    const createdAt = new Date();
    const expireAt = new Date(createdAt.getTime());
    expireAt.setSeconds(createdAt.getSeconds() + ACCESS_TOKEN_VALIDITY_PERIOD_SEC);

    OAuthToken.create({
      clientId: client._id,
      accessToken,
      createdAt,
      expireAt,
    }, (err) => {
      if (err) {
        res.status(500);
        res.send(err);
        return;
      }
      res.status(200);
      res.send({
        access_token: accessToken,
        token_type: 'bearer',
        expires_in: ACCESS_TOKEN_VALIDITY_PERIOD_SEC,
      });
    });
  })(req, res);
};
