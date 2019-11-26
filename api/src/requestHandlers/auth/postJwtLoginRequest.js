import passport from 'api/auth/passport';
import { createUserJWT, createUserRefreshJWT } from 'api/auth/jwt';
import { AUTH_FAILURE } from 'api/auth/utils';
import buildRefreshCookieOption from '../utils/buildRefreshCookieOption';

/**
 * Requests a JWT token to provide a user with access to the application.
 * @param {Express.Request} req  The request
 * @param {Express.Response} res  The response object
 * @param {Function} next
 * @return {Promise<void>} HTTP 200 OK on success
 */
export default async function postJwtLoginRequest(req, res, next) {
  passport.authenticate('userBasic', { session: false }, (err, data) => {
    if (err) {
      return next(err); // will generate a 500 error
    }

    // return method for failed authentication
    const authFailure = (reason, statusCode = 401) => {
      res.removeHeader('WWW-Authenticate');
      let message;
      switch (reason) {
        case AUTH_FAILURE.USER_NOT_FOUND:
        case AUTH_FAILURE.PASSWORD_INCORRECT:
        case AUTH_FAILURE.LOCKED_OUT:
          message = 'Incorrect login details';
          break;
        default:
          message = `There was an error (code: ${reason})`;
          break;
      }
      res.status(statusCode).send({ success: false, message });
    };

    // retrieve the user
    const user = data.user;

    // if login was not a success then add a failed attempt
    if (!data.success || !user) {
      // check if we should flush the expiry and attempts first
      // (might be our first attempt since being locked out..)
      if (user) {
        if (data.clearLockout) {
          user.authLockoutExpiry = null;
          user.authFailedAttempts = 0;
        }

        // increment the failed attempts
        user.authFailedAttempts += 1;

        // if we are not already locked out, check if we have hit our limit of allowed attempts
        if (
          !user.authLockoutExpiry &&
          user.authFailedAttempts >= user.ownerOrganisationSettings.LOCKOUT_ATTEMPS
        ) {
          user.authLockoutExpiry = new Date();
        }
        user.authLastAttempt = new Date();
        return user.save(() =>
          authFailure(data.reason)
        );
      }
      return authFailure(data.reason);
    }

    // if the login is good to go, then clear the attempts and any expiry that might still be hanging around
    user.authLockoutExpiry = null;
    user.authFailedAttempts = 0;
    user.authLastAttempt = new Date();
    return user.save(async () => {
      try {
        const [accessToken, refreshToken] = await Promise.all([
          createUserJWT(user),
          createUserRefreshJWT(user)
        ]);
        res
          .cookie(
            `refresh_token_user_${user._id}`,
            refreshToken,
            buildRefreshCookieOption(req.protocol),
          )
          .set('Content-Type', 'text/plain')
          .send(accessToken);
      } catch (err) {
        authFailure(err);
      }
    });
  })(req, res, next);
};
