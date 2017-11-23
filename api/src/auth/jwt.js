import jwt from 'jsonwebtoken';
import Promise from 'bluebird';
import union from 'lodash/union';
import map from 'lodash/map';
import reject from 'lodash/reject';
import isEmpty from 'lodash/isEmpty';
import toString from 'lodash/toString';
import { VIEW_SHAREABLE_DASHBOARD } from 'lib/constants/scopes';
import Role from 'lib/models/role';
import getActiveOrgSettings from 'api/utils/getActiveOrgSettings';

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

const payloadDefaults = ({
  provider = 'native',
  scopes = [],
  extensions = {},
  ...others
}) => ({
  provider,
  scopes,
  extensions,
  ...others
});

const createJWT = ({
  userId,
  provider,
  scopes,
  filter,
  tokenType,
  tokenId,
  extensions
}, opts = {
  expiresIn: '7d'
}) => sign(
  { userId, provider, scopes, tokenType, tokenId, extensions, filter },
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

const createUserJWT = (user, provider) =>
  createJWT(createUserTokenPayload(user, provider));

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
  return createJWT(orgTokenPayload);
};

const createDashboardTokenPayload = async (dashboard, provider) => {
  const visualisationIds = getVisualisationIdsFromDashboard(dashboard);
  return payloadDefaults({
    provider,
    scopes: getDashboardScopes(dashboard),
    tokenType: 'dashboard',
    tokenId: String(dashboard._id),
    filter: JSON.parse(dashboard.filter),
    extensions: {
      visualisationIds,
    }
  });
};

const createDashboardJWT = async (dashboard, provider) => {
  const dashboardPayload = await createDashboardTokenPayload(dashboard, provider);
  return createJWT(dashboardPayload);
};

export {
  createJWT,
  createUserTokenPayload,
  createUserJWT,
  createOrgTokenPayload,
  createOrgJWT,
  createDashboardTokenPayload,
  createDashboardJWT
};
