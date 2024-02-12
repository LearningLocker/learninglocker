import passport from 'passport';
import jsonwebtoken from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import ms from 'ms';
import logger from 'lib/logger';
import User from 'lib/models/user';
import OAuthToken from 'lib/models/oAuthToken';
import { sendResetPasswordToken } from 'lib/helpers/email';
import { AUTH_JWT_REFRESH } from 'lib/constants/routes';
import {
  ACCESS_TOKEN_VALIDITY_PERIOD_SEC,
  JWT_REFRESH_TOKEN_EXPIRATION,
  DEFAULT_PASSPORT_OPTIONS
} from 'lib/constants/auth';
import Unauthorized from 'lib/errors/Unauthorised';
import { createOrgJWT, createOrgRefreshJWT, createUserJWT, createUserRefreshJWT } from 'api/auth/jwt';
import { AUTH_FAILURE } from 'api/auth/utils';
import catchErrors from 'api/controllers/utils/catchErrors';

const buildRefreshCookieOption = (protocol) => {
  const validPeriodMsec = ms(JWT_REFRESH_TOKEN_EXPIRATION);

  const cookieOption = {
    path: `/api${AUTH_JWT_REFRESH}`,
    expires: new Date(Date.now() + validPeriodMsec),
    maxAge: validPeriodMsec,
    httpOnly: true,
    sameSite: 'Strict',
  };

  if (protocol === 'https') {
    return { ...cookieOption, secure: true };
  }
  return cookieOption;
};

/**
 * Generate and email a password reset token to a user through their email
 * @param  {Object}   req  The request
 * @param  {Object}   res  The response object
 * @param  {Function} next
 * @return HTTP 204 No Content on success
 */
const resetPasswordRequest = (req, res, next) => {
  const { email } = req.body;
  User.findOne({ email }, (findErr, user) => {
    if (findErr) {
      return next(findErr);
    }

    if (!user) {
      return res.status(204).send();
    }

    return user.createResetToken((token) => {
      user.resetTokens.push(token);
      user.save((err) => {
        if (err) {
          logger.error('Password reset error', err);
          return res.status(500).send({ message: 'There was an issue. Please try again' });
        }

        // @TODO: send status based on outcome of send!!
        sendResetPasswordToken(user, token);

        return res.status(204).send();
      });
    });
    // create a reset token and insert it onto the user
  });
};

/**
 * Reset a users password with a valid password reset token
 * @param  {Object}   req  The request
 * @param  {Object}   res  The response object
 * @param  {Function} next
 * @return HTTP 200 with user on success
 */
const resetPassword = (req, res, next) => {
  const { email, token, password } = req.body;
  const now = new Date();

  if (password.length === 0) {
    return res.status(400).send({ message: 'You must enter a password' });
  }

  return User.findOne(
    {
      email,
      'resetTokens.token': token,
      'resetTokens.expires': { $gt: now }
    },
    (err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(404).send({ message: 'Invalid password reset token. Please submit a new request' });
      }

      // clear the reset tokens, any lockouts and save the password
      // (hashing and validation will need to take place)
      user.resetTokens = [];
      user.password = password;

      // save the user
      return user.save((err, savedUser) => {
        // validation errors may get thrown here, return the error message
        if (err) {
          if (err.statusCode) {
            res.status(err.statusCode);
          } else {
            res.status(400);
          }
          return res.send(err);
        }

        // return the saved user
        return res.send(savedUser);
      });
    }
  );
};

const jwt = (req, res, next) => {
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
    return user.save(() =>
      Promise.all([createUserJWT(user), createUserRefreshJWT(user)])
        .then(
          ([accessToken, refreshToken]) =>
            res
              .cookie(
                `refresh_token_user_${user._id}`,
                refreshToken,
                buildRefreshCookieOption(req.protocol),
              )
              .set('Content-Type', 'text/plain')
              .send(accessToken)
          )
        .catch(authFailure)
    );
  })(req, res, next);
};

const jwtRefresh = catchErrors(async (req, res) => {
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


const includes = (organisations, orgId) =>
  organisations.filter(organisationId =>
    String(organisationId) === orgId
  ).length !== 0;

const jwtOrganisation = (req, res) => {
  const organisationId = req.body.organisation;
  const { user } = req;
  const userAccessToken = req.user.authInfo.token;
  // check that the user exists in this organisation
  if (includes(user.organisations, organisationId)) {
    Promise.all([
      createOrgJWT(user, organisationId, userAccessToken.provider),
      createOrgRefreshJWT(user, organisationId, userAccessToken.provider),
    ]).then(
      ([orgAccessToken, orgRefreshToken]) =>
        res
          .cookie(
            `refresh_token_organisation_${organisationId}`,
            orgRefreshToken,
            buildRefreshCookieOption(req.protocol),
          )
          .set('Content-Type', 'text/plain')
          .send(orgAccessToken)
    ).catch(err => res.status(500).send(err));
  } else {
    res.status(401).send('User does not have access to this organisation.');
  }
};

const clientInfo = (req, res) => {
  const authInfo = req.user.authInfo || {};
  const { title, lrs_id, organisation, scopes } = authInfo.client;

  const response = {
    title,
    organisation,
    lrs_id,
    scopes
  };
  res.status(200).send(response);
};

const success = (req, res) => {
  res.send('Login success!');
};

const issueOAuth2AccessToken = (req, res) => {
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

export default {
  clientInfo,
  resetPasswordRequest,
  resetPassword,
  jwt,
  jwtRefresh,
  jwtOrganisation,
  success,
  issueOAuth2AccessToken,
};
