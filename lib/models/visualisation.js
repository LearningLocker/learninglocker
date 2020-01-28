import _ from 'lodash';
import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import * as scopes from 'lib/constants/scopes';
import { getConnection } from 'lib/connections/mongoose';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getDashboardFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getDashboardFromAuthInfo';
import { isKeyedJSONString } from 'lib/utils/validators/jsonValidator';

const statementContents = new mongoose.Schema({
  Path: { type: String },
  Title: { type: String },
  User_Title: { type: mongoose.Schema.Types.ObjectId, ref: 'Visualisation' }
});

const buildJsonValidators = columnName => ({
  validator: isKeyedJSONString,
  message: `${columnName} must be a JSON string whose parsed value is non-array object`,
});

// TODO: Remove `oldAxesxQuery`, `oldAxesyQuery`, `oldFilters`, and `hasBeenMigrated` after we confirm success of $in migration
const schema = new mongoose.Schema({
  description: { type: String },
  type: { type: String },
  axes: { // Deprecated
    type: String
  },
  axesgroup: {
    type: String,
    validate: buildJsonValidators('axesgroup'),
  },
  axesxLabel: {
    type: String
  },
  axesxValue: {
    type: String,
    validate: buildJsonValidators('axesxValue'),
  },
  axesxOperator: {
    type: String
  },
  axesxQuery: {
    type: String,
    validate: buildJsonValidators('axesxQuery'),
  },
  oldAxesxQuery: {
    type: String,
  },
  axesyLabel: {
    type: String
  },
  axesyValue: {
    type: String,
    validate: buildJsonValidators('axesyValue'),
  },
  axesyOperator: {
    type: String
  },
  axesyQuery: {
    type: String,
    validate: buildJsonValidators('axesyQuery'),
  },
  oldAxesyQuery: {
    type: String
  },
  axesvalue: {
    type: String,
    validate: buildJsonValidators('axesvalue'),
  },
  axesquery: {
    type: String
  },
  axesoperator: {
    type: String
  },
  stacked: { type: Boolean, default: true },
  trendLines: { type: Boolean, default: false },
  sourceView: { type: Boolean, default: false },
  filters: [{
    type: String,
    default: ['{$match: {}}'],
    validate: buildJsonValidators('every items in "filters"'),
  }],
  oldFilters: { type: [{ type: String, default: ['{$match: {}}'] }], default: undefined },
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    index: true
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  suggestedStep: { type: String },
  previewPeriod: { type: String, default: 'LAST_7_DAYS' },
  benchmarkingEnabled: { type: Boolean, default: false },
  isDonut: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },
  barChartGroupingLimit: { type: Number, default: 10 },
  statementContents: [statementContents],
  hasBeenMigrated: { type: Boolean, default: false },
  timezone: { type: String },
  showStats: { type: Boolean, default: true },
  statsAtBottom: { type: Boolean, default: true },
  contextLabel: { type: String },
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(scopeChecks);
schema.plugin(timestamps);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

const getVisualisationIdsFromAuth = authInfo =>
  authInfo.token.extensions.visualisationIds;

const getVisualisationFilterFromAuth = (authInfo, baseFilter = {}) => ({
  ...baseFilter,
  _id: { $in: getVisualisationIdsFromAuth(authInfo) }
});

schema.statics.filterByAuth = async function filterByAuth(authInfo, filter) {
  const authScopes = getScopesFromAuthInfo(authInfo);
  const organisationId = getOrgFromAuthInfo(authInfo);
  const dashboardId = getDashboardFromAuthInfo(authInfo);
  const isSiteAdmin = _.includes(authScopes, scopes.SITE_ADMIN);
  if (isSiteAdmin && !organisationId && !dashboardId) return filter;
  if (organisationId) return await this.getOrgFilterFromAuth(authInfo, filter);
  if (dashboardId) return getVisualisationFilterFromAuth(authInfo, filter);
  throw new Error('Could not validate auth');
};

const Visualisation = getConnection().model(
  'Visualisation',
  schema,
  'visualisations'
);

export default Visualisation;
