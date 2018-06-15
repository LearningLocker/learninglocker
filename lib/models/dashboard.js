import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getDashboardFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getDashboardFromAuthInfo';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import sharingScopes, { NOWHERE } from 'lib/constants/sharingScopes';
import keys from 'lodash/keys';
import includes from 'lodash/includes';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import { OFF, ANY, JWT_SECURED } from 'lib/constants/dashboard';

const objectId = mongoose.Types.ObjectId;

const widgetSchema = new mongoose.Schema({
  title: { type: String },
  suggestedStep: { type: String },
  visualisation: { type: mongoose.Schema.Types.ObjectId, ref: 'Visualisation' },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  w: { type: Number, default: 4 },
  h: { type: Number, default: 4 }
});

const shareableSchema = new mongoose.Schema({
  title: { type: String, default: '~ Shareable' },
  filter: { type: String, default: '{}' },
  visibility: { type: String, enum: sharingScopes, default: NOWHERE },
  validDomains: { type: String },
  createdAt: { type: Date, default: new Date() },

  filterMode: { type: String, enum: [OFF, ANY, JWT_SECURED], default: OFF },
  filterJwtSecret: {
    type: String,
    default: "",
    validate: { // Ensure that it is set
      validator(value) {
        if (this.filterMode !== JWT_SECURED) {
          return true;
        }
        if (!value) {
          return false;
        }
        return true;
      },
      message: 'Jwt token must be set'
    }
  }
});

export const schema = new mongoose.Schema({
  title: { type: String },
  widgets: [widgetSchema],
  shareable: [shareableSchema],
  organisation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organisation',
    index: true
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  isPublic: { type: Boolean, default: false }
});

schema.readScopes = keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(timestamps);
schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

const getDashboardFilter = (dashboardId, baseFilter = {}) => ({
  ...baseFilter,
  _id: objectId(dashboardId)
});

schema.statics.filterByAuth = async function filterByAuth(authInfo, filter) {
  const authScopes = getScopesFromAuthInfo(authInfo);
  const organisationId = getOrgFromAuthInfo(authInfo);
  const dashboardId = getDashboardFromAuthInfo(authInfo);
  const isSiteAdmin = includes(authScopes, scopes.SITE_ADMIN);
  if (isSiteAdmin && !organisationId && !dashboardId) return filter;
  if (organisationId) return await this.getOrgFilterFromAuth(authInfo, filter);
  if (dashboardId) return getDashboardFilter(dashboardId, filter);
  throw new Error('Could not validate auth');
};

const Dashboard = getConnection().model('Dashboard', schema, 'dashboards');
export default Dashboard;
