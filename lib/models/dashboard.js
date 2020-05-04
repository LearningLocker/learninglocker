import mongoose from 'mongoose';
import { keys, includes, omit } from 'lodash';
import timestamps from 'mongoose-timestamp';
import { getConnection } from 'lib/connections/mongoose';
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
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import { OFF, ANY, JWT_SECURED } from 'lib/constants/dashboard';
import logger from 'lib/logger';

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

// TODO: Remove `oldFilter` after we confirm success of $in migration
const shareableSchema = new mongoose.Schema({
  title: { type: String, default: '~ Shareable' },
  filter: { type: String, default: '{}' },
  oldFilter: { type: String, default: undefined },
  timezone: { type: String },
  visibility: { type: String, enum: sharingScopes, default: NOWHERE },
  validDomains: { type: String },
  createdAt: { type: Date, default: new Date() },

  filterMode: { type: String, enum: [OFF, ANY, JWT_SECURED], default: OFF },
  filterRequired: { type: Boolean, default: false },
  filterJwtSecret: {
    type: String,
    default: '',
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

// TODO: Remove `hasBeenMigrated` after we confirm success of $in migration
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
  isPublic: { type: Boolean, default: false },
  hasBeenMigrated: { type: Boolean, default: false },
  type: { type: String },
});

schema.readScopes = keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(timestamps);
schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

/**
 * @param {Object} widgets
 * @return {boolean}
 */
const hasDuplicatedWidgetIds = (widgets) => {
  const widgetIds = {};
  return widgets.some((widget) => {
    if (widget._id === undefined) {
      return false;
    }

    const wid = (typeof widget._id === 'string') ? widget._id : widget._id.toString();

    if (widgetIds[wid]) {
      return true;
    }

    widgetIds[wid] = true;
    return false;
  });
};

schema.pre('save', async function preSave(next) {
  const widgets = this.widgets || [];
  if (hasDuplicatedWidgetIds(widgets)) {
    logger.warn(JSON.stringify({
      message: 'The dashboard had duplicated widget ids. All widget ids are reset',
      requestBody: this,
    }));
    this.widgets = widgets.map(w => omit(w, '_id'));
  }
  next();
});

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
