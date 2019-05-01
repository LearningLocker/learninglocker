import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import * as scopes from 'lib/constants/scopes';
import keys from 'lodash/keys';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getDashboardFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getDashboardFromAuthInfo';
import includes from 'lodash/includes';

const statementContents = new mongoose.Schema({
  Path: { type: String },
  Title: { type: String },
  User_Title: { type: mongoose.Schema.Types.ObjectId, ref: 'Visualisation' }
});

// TODO: Remove `oldAxesxQuery`, `oldAxesyQuery`, `oldFilters`, and `hasBeenMigrated` after we confirm success of $in migration
// See: https://ht2labs.myjetbrains.com/youtrack/issue/LL-595
const schema = new mongoose.Schema({
  description: { type: String },
  type: { type: String },
  axes: { // Deprecated
    type: String
  },
  axesgroup: {
    type: String
  },
  axesxLabel: {
    type: String
  },
  axesxValue: {
    type: String
  },
  axesxOperator: {
    type: String
  },
  axesxQuery: {
    type: String
  },
  oldAxesxQuery: {
    type: String,
  },
  axesyLabel: {
    type: String
  },
  axesyValue: {
    type: String
  },
  axesyOperator: {
    type: String
  },
  axesyQuery: {
    type: String
  },
  oldAxesyQuery: {
    type: String
  },
  axesvalue: {
    type: String
  },
  axesquery: {
    type: String
  },
  axesoperator: {
    type: String
  },
  stacked: { type: Boolean, default: true },
  trendLines: { type: Boolean, default: false },
  chart: { type: String, default: 'LINE' },
  sourceView: { type: Boolean, default: false },
  filters: [{ type: String, default: ['{$match: {}}'] }],
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
  templateId: { type: String },
  templateStage: { type: String },
});

schema.readScopes = keys(scopes.USER_SCOPES);
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
  const isSiteAdmin = includes(authScopes, scopes.SITE_ADMIN);
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
