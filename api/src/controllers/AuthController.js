import jsonwebtoken from 'jsonwebtoken';
import User from 'lib/models/user';
import { AUTH_JWT_SUCCESS } from 'lib/constants/routes';
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

export default {
  clientInfo,
  jwtRefresh,
  googleSuccess,
  success,
};
