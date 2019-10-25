import { createOrgJWT, createOrgRefreshJWT } from 'api/auth/jwt';
import { buildRefreshCookieOption } from './utils/buildRefreshCookieOption';

/**
 * Requests a JWT token to provide a user with access to a given organisation.
 * @param {Express.Request} req  The request
 * @param {Express.Response} res  The response object
 * @return {Promise<void>} HTTP 200 OK on success
 */
export async function postJwtOrganisationRequest(req, res) {
  const organisationId = req.body.organisation;
  const { user } = req;
  const userAccessToken = req.user.authInfo.token;

  // Check that the user exists in this organisation.
  const isUserInOrg = organisations.filter((organisationId) => {
    return String(organisationId) === orgId;
  }).length !== 0;

  if (isUserInOrg) {
    try {
      const [orgAccessToken, orgRefreshToken] = await Promise.all([
        createOrgJWT(user, organisationId, userAccessToken.provider),
        createOrgRefreshJWT(user, organisationId, userAccessToken.provider),
      ]);
      res
        .cookie(
          `refresh_token_organisation_${organisationId}`,
          orgRefreshToken,
          buildRefreshCookieOption(req.protocol),
        )
        .set('Content-Type', 'text/plain')
        .send(orgAccessToken);
    } catch (err) {
      res.status(500).send(err)
    }
  } else {
    res.status(401).send('User does not have access to this organisation.');
  }
}
