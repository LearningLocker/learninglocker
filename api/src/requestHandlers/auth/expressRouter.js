import express from 'express';
import passport from 'passport';
import { GOOGLE_AUTH_OPTIONS, DEFAULT_PASSPORT_OPTIONS } from 'lib/constants/auth';
import * as routes from 'lib/constants/routes';
import getClientInfo from './getClientInfo';
import getGoogleAuthConfig from './getGoogleAuthConfig';
import getGoogleSuccess from './getGoogleSuccess';
import getLoginSuccess from './getLoginSuccess';
import postJwtLoginRequest from './postJwtLoginRequest';
import postJwtOrganisationRequest from './postJwtOrganisationRequest';
import postJwtRefreshRequest from './postJwtRefreshRequest';
import postOAuth2TokenRequest from './postOAuth2TokenRequest';
import postPasswordReset from './postPasswordReset';
import postPasswordResetRequest from './postPasswordResetRequest';

const router = new express.Router();

router.get(routes.GOOGLE_AUTH, getGoogleAuthConfig);
router.post(routes.AUTH_RESETPASSWORD_REQUEST, postPasswordResetRequest);
router.post(routes.AUTH_RESETPASSWORD_RESET, postPasswordReset);
router.post(routes.AUTH_JWT_PASSWORD, postJwtLoginRequest);
router.post(
  routes.AUTH_JWT_ORGANISATION,
  passport.authenticate('jwt', DEFAULT_PASSPORT_OPTIONS),
  postJwtOrganisationRequest
);

router.post(routes.AUTH_JWT_REFRESH, postJwtRefreshRequest);

router.get(
  routes.AUTH_CLIENT_INFO,
  passport.authenticate('clientBasic', DEFAULT_PASSPORT_OPTIONS),
  getClientInfo
);

router.post(routes.OAUTH2_TOKEN, postOAuth2TokenRequest);

if (process.env.GOOGLE_ENABLED) {
  router.get(
    routes.AUTH_JWT_GOOGLE,
    passport.authenticate('google', GOOGLE_AUTH_OPTIONS)
  );
  router.get(
    routes.AUTH_JWT_GOOGLE_CALLBACK,
    passport.authenticate('google', DEFAULT_PASSPORT_OPTIONS),
    getGoogleSuccess
  );
}

router.get(
  routes.AUTH_JWT_SUCCESS,
  passport.authenticate('jwt', DEFAULT_PASSPORT_OPTIONS),
  getLoginSuccess
);

export default router;
