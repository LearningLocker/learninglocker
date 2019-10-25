import passport from 'passport';
import jsonwebtoken from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import User from 'lib/models/user';
import OAuthToken from 'lib/models/oAuthToken';
import { AUTH_JWT_SUCCESS } from 'lib/constants/routes';
import {
  ACCESS_TOKEN_VALIDITY_PERIOD_SEC,
  DEFAULT_PASSPORT_OPTIONS
} from 'lib/constants/auth';
import Unauthorized from 'lib/errors/Unauthorised';
import { createOrgJWT, createUserJWT } from 'api/auth/jwt';
import catchErrors from 'api/controllers/utils/catchErrors';

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
  jwtRefresh,
  googleSuccess,
  success,
  issueOAuth2AccessToken,
};
