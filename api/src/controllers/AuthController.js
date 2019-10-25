import { AUTH_JWT_SUCCESS } from 'lib/constants/routes';
import { createUserJWT } from 'api/auth/jwt';

const googleSuccess = (req, res) => {
  // we have successfully signed into google
  // create a JWT and set it in the query params (only way to return it with a redirect)
  createUserJWT(req.user, 'google')
    .then(token => res.redirect(`/api${AUTH_JWT_SUCCESS}?access_token=${token}`))
    .catch(err => res.status(500).send(err));
};

const success = (req, res) => {
  res.send('Login success!');
};

export default {
  googleSuccess,
  success,
};
