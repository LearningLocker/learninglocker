import passport from 'passport';
import logger from 'lib/logger';
import { BasicStrategy } from 'passport-http';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import Promise from 'bluebird';
import CustomStrategy from 'passport-custom';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { find, get, omit, omitBy } from 'lodash';
import { fromJS } from 'immutable';
import Client from 'lib/models/client';
import User from 'lib/models/user';
import Dashboard from 'lib/models/dashboard';
import { getCookieNameStartsWith, getCookieName } from 'ui/utils/auth';
import Unauthorized from 'lib/errors/Unauthorised';

import {
  createOrgTokenPayload,
  createUserTokenPayload,
  createDashboardTokenPayload
} from 'api/auth/jwt';
import { AUTH_FAILURE } from 'api/auth/utils';

const verifyPromise = Promise.promisify(jwt.verify);

const createPayloadFromPayload = (payload) => {
  const dependencies = {};
  if (payload.userId) {
    dependencies.user = User.findOne({ _id: payload.userId });
  }
  if (payload.tokenType === 'dashboard') {
    dependencies.dashboard = Dashboard.findOne({ _id: payload.tokenId });
  }

  return Promise.props(dependencies).then(async ({ user, dashboard }) => {
    const tokenId = payload.tokenId;
    const provider = payload.provider;

    switch (payload.tokenType) {
      case 'organisation': {
        const expectedToken = await createOrgTokenPayload(
          user,
          tokenId,
          provider
        );
        return { expectedToken, user };
      }
      case 'dashboard': {
        const shareable = find(dashboard.shareable, share =>
          share._id.toString() === payload.shareableId
        );

        const expectedToken = await createDashboardTokenPayload(
          dashboard,
          (shareable ? shareable._id.toString() : null),
          provider
        );
        return { expectedToken };
      }
      case 'user':
      default: {
        const expectedToken = await createUserTokenPayload(user, provider);
        return { expectedToken, user };
      }
    }
  });
};

async function verifyToken(token, done) {
  try {
    const decodedToken = await verifyPromise(token, process.env.APP_SECRET);

    // Recreates the token's payload to make sure that all scopes are still valid.

    const { expectedToken, user } = await createPayloadFromPayload(
      decodedToken
    );
    const tokenToVerify1 = omit(decodedToken, ['iat', 'exp']);
    const tokenToVerify = omitBy(tokenToVerify1, (v, k) => k === 'shareableId' && !v);

    const iExpectedToken = fromJS(expectedToken);
    const iTokenToVerify = fromJS(tokenToVerify);

    const iExpectedToken2 = iExpectedToken.filter((value, key) => key !== 'filter');
    const iTokenToVerify2 = iTokenToVerify.filter((value, key) => key !== 'filter');

    if (!iExpectedToken2.toMap().equals(iTokenToVerify2.toMap())) {
      throw new Unauthorized('Unverified token');
    }
    const auth = {
      ...(user ? user.toObject() : {}),
      authInfo: { user, token: decodedToken }
    };
    done(null, auth);
    return auth;
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return done(null, false);
    }
    logger.error('Auth error:', err);
    done(err);
  }
}

passport.use('jwt', new BearerStrategy(verifyToken));

passport.use(
  'jwt-cookie',
  new CustomStrategy((req, done) => {
    // get the user token
    const organisationId = req.params.organisationId;
    let cookieName;
    if (organisationId) {
      cookieName = getCookieName({ tokenType: 'organisation', tokenId: organisationId });
    } else {
      // org not set so we can't pick a specific org token
      cookieName = getCookieNameStartsWith({ tokenType: 'user' }, req.cookies);
    }

    const token = req.cookies[cookieName];
    verifyToken(token, done);
  })
);

// passport.authenticate('userBasic', { session: false })
passport.use(
  'userBasic',
  new BasicStrategy((username, password, done) => {
    const info = {
      user: false,
      clearLockout: false,
      reason: null,
      success: false
    };
    if (password === '' || !password) return done(null, info);

    User.findOne({ email: username }, (err, user) => {
      if (err) return done(err);
      if (!user) {
        info.reason = AUTH_FAILURE.USER_NOT_FOUND;
        return done(null, info);
      }

      info.user = user;

      // are lockouts enabled on this user?
      if (user.ownerOrganisationSettings.LOCKOUT_ENABLED) {
        // is there currently a lockout associated with the user?
        if (user.authLockoutExpiry) {
          const lockoutMs = (user.ownerOrganisationSettings.LOCKOUT_SECONDS || 30) * 1000;
          const acceptExpiresSince = new Date(Date.now() - lockoutMs);

          // is the current lockout still valid? (i.e. should we reject them?)
          if (user.authLockoutExpiry >= acceptExpiresSince) {
            info.reason = AUTH_FAILURE.LOCKED_OUT;
            return done(null, info);
          }

          // if the lockout is no longer valid, we should mark to scrub it from the user and proceed with authentication
          info.clearLockout = true;
        }
      }

      bcrypt.compare(password, user.password, (compareErr, success) => {
        info.success = success;
        if (!success) {
          info.reason = AUTH_FAILURE.PASSWORD_INCORRECT;
        }
        return done(null, info);
      });
    });
  })
);

passport.use(
  'clientBasic',
  new BasicStrategy((clientId, clientSecret, done) => {
    Client.findOne({ 'api.basic_key': clientId }, (err, client) => {
      if (err) return done(err);
      if (!client) return done(null, false);
      if (!client.isTrusted) return done(null, false);
      client.authInfo = {
        client,
        scopes: client.scopes,
        token: {
          tokenType: 'client'
        }
      };
      if (client.api.basic_secret === clientSecret) return done(null, client);
      return done(null, false);
    });
  })
);

/**
 * Based on RFC 6749
 */
passport.use(
  'OAuth2_Authorization',
  new CustomStrategy((req, done) => {
    const grantType = req.body.grant_type;
    const clientId = req.body.client_id;
    const clientSecret = req.body.client_secret;

    if (
      grantType === undefined ||
      clientId === undefined ||
      clientSecret === undefined
    ) {
      done({ isClientError: true, error: 'invalid_request' });
      return;
    }

    if (grantType !== 'client_credentials') {
      done({ isClientError: true, error: 'unsupported_grant_type' });
      return;
    }

    Client.findOne(
      {
        'api.basic_key': clientId,
        'api.basic_secret': clientSecret,
        isTrusted: true,
      },
      (err, client) => {
        if (err) {
          done({ error: err });
          return;
        }

        if (!client) {
          done({ isClientError: true, error: 'invalid_client' });
          return;
        }

        client.authInfo = {
          client,
          scopes: client.scopes,
          token: {
            tokenType: 'client'
          }
        };

        done(null, client);
      }
    );
  })
);

export default passport;
