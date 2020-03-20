import jwt from 'jsonwebtoken';
import Promise from 'bluebird';
import union from 'lodash/union';
import map from 'lodash/map';
import reject from 'lodash/reject';
import isEmpty from 'lodash/isEmpty';
import toString from 'lodash/toString';
import { JWT_ACCESS_TOKEN_EXPIRATION, JWT_REFRESH_TOKEN_EXPIRATION } from 'lib/constants/auth';
import { VIEW_SHAREABLE_DASHBOARD } from 'lib/constants/scopes';
import Role from 'lib/models/role';
import Organisation from 'lib/models/organisation';
import getActiveOrgSettings from 'api/utils/getActiveOrgSettings';

/**
 * @param {string | object | Buffer}
 * @param {jwt.Secret}
 * @returns {Promise<any>}
 */
const sign = Promise.promisify(jwt.sign);

const getUserScopes = user =>
  user.scopes;

const getDashboardScopes = () =>
  [VIEW_SHAREABLE_DASHBOARD];

const getVisualisationIdsFromDashboard = (dashboard) => {
  let visualisationIds = map(dashboard.widgets, 'visualisation');
  visualisationIds = reject(visualisationIds, isEmpty);
  visualisationIds = map(visualisationIds, toString);
  return visualisationIds;
};

const getOrgTimezoneFromDashboard = async (dashboard) => {
  const org = await Organisation.findOne({ _id: dashboard.organisation });
  return org && org.timezone ? org.timezone : null;
};

const payloadDefaults = ({
  provider = 'native',
  scopes = [],
  extensions = {},
  organisation = null,
  ...others
}) => ({
  provider,
  scopes,
  extensions,
  organisation,
  ...others
});

/**
 * @param {*} - payload
 * @param {*} opts - (optional)
 * @returns {Promise<string>}
 */
const createJWT = ({
  userId,
  provider,
  scopes,
  filter,
  tokenType,
  tokenId,
  shareableId = null,
  extensions,
  organisation = null
}, opts = {
  expiresIn: '1h'
}) => sign(
  { userId, provider, scopes, tokenType, tokenId, shareableId, extensions, filter, organisation },
  process.env.APP_SECRET,
  opts
);

const createUserTokenPayload = (user, provider) => payloadDefaults({
  userId: String(user._id),
  provider,
  scopes: getUserScopes(user),
  tokenType: 'user',
  tokenId: String(user._id),
});

/**
 * @param {*} user
 * @param {*} provider
 * @returns {Promise<string>}
 */
const createUserJWT = (user, provider) =>
  createJWT(
    createUserTokenPayload(user, provider),
    { expiresIn: JWT_ACCESS_TOKEN_EXPIRATION },
  );

const createUserRefreshTokenPayload = (user, provider) => payloadDefaults({
  userId: String(user._id),
  provider,
  scopes: ['refresh_token_user'],
  tokenType: 'user_refresh',
  tokenId: String(user._id),
});

/**
 * @param {*} user
 * @param {*} provider
 * @returns {Promise<string>}
 */
const createUserRefreshJWT = (user, provider) =>
  createJWT(
    createUserRefreshTokenPayload(user, provider),
    { expiresIn: JWT_REFRESH_TOKEN_EXPIRATION },
  );

const createOrgTokenPayload = async (user, orgId, provider) => {
  const activeOrgSettings = getActiveOrgSettings(user, orgId);
  const roleIds = activeOrgSettings.roles;
  const roles = await Role.find({ _id: { $in: roleIds } });
  const roleScopes = union(...roles.map(role => role.scopes));
  const scopes = [
    ...roleScopes,
    ...getUserScopes(user),
  ];
  const filter = JSON.parse(activeOrgSettings.filter);
  return payloadDefaults({
    userId: String(user._id),
    provider,
    tokenType: 'organisation',
    tokenId: orgId,
    filter,
    scopes,
  });
};
const createOrgJWT = async (user, organisationId, provider) => {
  const orgTokenPayload = await createOrgTokenPayload(user, organisationId, provider);
  return createJWT(
    orgTokenPayload,
    { expiresIn: JWT_ACCESS_TOKEN_EXPIRATION },
  );
};

const createOrgRefreshTokenPayload = (user, organisationId, provider) => payloadDefaults({
  userId: String(user._id),
  provider,
  scopes: ['refresh_token_organisation'],
  tokenType: 'organisation_refresh',
  tokenId: organisationId,
});

/**
 * @param {*} user
 * @param {*} organisationId
 * @param {*} provider
 * @returns {Promise<string>}
 */
const createOrgRefreshJWT = (user, organisationId, provider) =>
  createJWT(
    createOrgRefreshTokenPayload(user, organisationId, provider),
    { expiresIn: JWT_REFRESH_TOKEN_EXPIRATION },
  );


const createDashboardTokenPayload = async (dashboard, shareableId, provider) => {
  if (!shareableId && dashboard.shareable.length > 0) {
    shareableId = dashboard.shareable[0]._id;
  }

  const visualisationIds = getVisualisationIdsFromDashboard(dashboard);

  const orgTimezone = await getOrgTimezoneFromDashboard(dashboard);

  return payloadDefaults({
    provider,
    scopes: getDashboardScopes(),
    tokenType: 'dashboard',
    tokenId: String(dashboard._id),
    shareableId,
    organisation: String(dashboard.organisation),
    filter: {},
    extensions: {
      visualisationIds,
      orgTimezone,
    }
  });
};

const createDashboardJWT = async (dashboard, shareableId, provider) => {
  const dashboardPayload = await createDashboardTokenPayload(dashboard, shareableId, provider);
  return createJWT(
    dashboardPayload,
    { expiresIn: JWT_ACCESS_TOKEN_EXPIRATION },
  );
};

export {
  createJWT,
  createUserTokenPayload,
  createUserJWT,
  createUserRefreshTokenPayload,
  createUserRefreshJWT,
  createOrgTokenPayload,
  createOrgJWT,
  createOrgRefreshTokenPayload,
  createOrgRefreshJWT,
  createDashboardTokenPayload,
  createDashboardJWT,
};
