import * as routes from 'lib/constants/routes';
import express from 'express';
import { DEFAULT_PASSPORT_OPTIONS } from 'lib/constants/auth';
import { ALL, SITE_ADMIN } from 'lib/constants/scopes';
import { MANAGE_ALL_USERS } from 'lib/constants/orgScopes';
import Unauthorised from 'lib/errors/Unauthorised';
import passport from 'api/auth/passport';
import UserOrganisationsController from 'api/controllers/UserOrganisationsController';
import handleRequestError from 'api/controllers/utils/handleRequestError';


const router = new express.Router();

const matchesTargetOrgAndTokenOrg = (req) => {
  if (req.user.authInfo.token.tokenType !== 'organisation') {
    return false;
  }

  const orgIdInToken = req.user.authInfo.token.tokenId;
  const orgIdInParams = req.params.organisationId;
  return (orgIdInToken === orgIdInParams);
};

const hasValidScope = (req) => {
  const scopes = req.user.authInfo.token.scopes;
  return scopes.some(s => [SITE_ADMIN, ALL, MANAGE_ALL_USERS].includes(s));
};

const canRemoveOrgFromUser = req =>
  matchesTargetOrgAndTokenOrg(req) &&
  hasValidScope(req);

/**
 * A express middleware checking auth
 *
 * If canHandle(req) is true, this function calls next().
 * If it is false, this function set errors on calls next('route');
 *
 * @param {(req) => boolean} canHandle
 */
const checkAuth = canHandle => (req, res, next) => {
  try {
    if (!canHandle(req)) {
      throw new Unauthorised();
    }
    next();
  } catch (err) {
    handleRequestError(res, err);
    next('route');
  }
};

/**
 * ORGANISATIONS
 */
router.delete(
  routes.USER_ORGANISATIONS,
  passport.authenticate(['jwt'], DEFAULT_PASSPORT_OPTIONS),
  checkAuth(canRemoveOrgFromUser),
  UserOrganisationsController.delete,
);

export default router;
