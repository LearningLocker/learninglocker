import passport from 'passport';
import User from 'lib/models/user';
import { sendResetPasswordToken } from 'lib/helpers/email';
import { AUTH_JWT_SUCCESS } from 'lib/constants/routes';
import { createOrgJWT, createUserJWT } from 'api/auth/jwt';
import { AUTH_FAILURE } from 'api/auth/utils';

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
      return res.status(404).send({ message: `No user found for ${email}` });
    }

    return user.createResetToken((token) => {
      user.resetTokens.push(token);
      user.save((err) => {
        if (err) {
          return res.status(500).send({ message: 'Could not save resetToken onto user' });
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
      $or: [
        {
          'resetTokens.token': token,
          'resetTokens.expires': { $gt: now }
        },
        {
          'resetTokens.token': token,
          'resetTokens.expires': null
        }
      ],
    },
    (err, user) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(404).send({ message: 'Password request has expired or has been used. Please submit a new request' });
      }

      // clear the reset tokens and save the password
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

    // return method for failed authenication
    const authFailure = (reason, statusCode = 401) => {
      res.removeHeader('WWW-Authenticate');
      let message;
      switch (reason) {
        case AUTH_FAILURE.USER_NOT_FOUND:
        case AUTH_FAILURE.PASSWORD_INCORRECT:
          message = 'Incorrect login details';
          break;
        case AUTH_FAILURE.LOCKED_OUT:
          message = 'Too many incorrect attempts. Account locked';
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
       createUserJWT(user).then()
          .then(token => res.send(token))
          .catch(authFailure)
    );
  })(req, res, next);
};

const includes = (organisations, orgId) =>
  organisations.filter(organisationId =>
    String(organisationId) === orgId
  ).length !== 0;

const jwtOrganisation = (req, res) => {
  const organisationId = req.body.organisation;
  const { user } = req;
  const { token } = req.user.authInfo;
  // check that the user exists in this organisation
  if (includes(user.organisations, organisationId)) {
    createOrgJWT(user, organisationId, token.provider)
      .then(newToken => res.send(newToken))
      .catch(err => res.status(500).send(err));
  } else {
    res.status(401).send('User does not have access to this organisation.');
  }
};

const googleSuccess = (req, res) => {
  // we have successfully signed into google
  // create a JWT and set it in the query params (only way to return it with a redirect)
  createUserJWT(req.user, 'google')
    .then(token => res.redirect(`/api${AUTH_JWT_SUCCESS}?access_token=${token}`))
    .catch(err => res.status(500).send(err));
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

export default {
  clientInfo,
  resetPasswordRequest,
  resetPassword,
  jwt,
  jwtOrganisation,
  googleSuccess,
  success
};
