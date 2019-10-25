import jsonwebtoken from 'jsonwebtoken';
import User from 'lib/models/user';
import Unauthorized from 'lib/errors/Unauthorised';
import { createOrgJWT, createUserJWT } from 'api/auth/jwt';
import { catchErrorsInResponse } from './utils/catchErrorsInResponse';

/**
 * Requests a JWT token to provide a user with access to the application.
 * @param {Express.Request} req  The request
 * @param {Express.Response} res  The response object
 * @return {Promise<void>} HTTP 200 OK on success
 */
export function postJwtRefreshRequest(req, res) {
  catchErrorsInResponse(res, async () => {
    try {
      const refreshToken = req.cookies[`refresh_token_${req.body.tokenType}_${req.body.id}`];
      const decodedToken = await jsonwebtoken.verify(refreshToken, process.env.APP_SECRET);

      const { tokenId, tokenType, userId, provider } = decodedToken;

      const user = await User.findOne({ _id: userId });

      if (!user) {
        throw new Unauthorized();
      }

      if (tokenType === 'user_refresh') {
        const newUserToken = await createUserJWT(user, provider);
        res.status(200).set('Content-Type', 'text/plain').send(newUserToken);
      } else if (tokenType === 'organisation_refresh') {
        const newOrgToken = await createOrgJWT(user, tokenId, provider);
        res.status(200).set('Content-Type', 'text/plain').send(newOrgToken);
      } else {
        throw new Unauthorized();
      }
    } catch (err) {
      if (['JsonWebTokenError', 'TokenExpiredError'].includes(err.name)) {
        throw new Unauthorized();
      }
      throw err;
    }
  });
};
