import _ from 'lodash';
import moment from 'moment';
import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import uploadSchema from 'lib/models/uploadSchema';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import { factory } from 'lib/services/files/storage';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import logger from 'lib/logger';
import SiteSettings from './siteSettings';
import Organisation from './organisation';

/**
 * get organisation expire TLL if expiration is allowed by the site and the organisations
 *
 * @param {mongoose.Types.ObjectId} organisationId
 * @return {Promise<number|undefined>}
 */
const getOrgExpireTTL = async (organisationId) => {
  const [organisation, siteSettings] =
    await Promise.all([
      Organisation.findById(organisationId),
      SiteSettings.findById(SITE_SETTINGS_ID),
    ]);

  const siteAllowsExportExpirations = _.get(siteSettings, 'allowExportExpirations', false);
  const orgAllowsExportExpirations = _.get(organisation, 'settings.EXPORT_EXPIRATION_ALLOW', false);
  const orgTTL = _.get(organisation, 'settings.EXPORT_EXPIRATION_TTL', undefined);

  if (siteAllowsExportExpirations && orgAllowsExportExpirations) {
    return orgTTL;
  }
  return undefined;
};

const schema = new mongoose.Schema({
  organisation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organisation',
    index: true
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  isReady: { type: Boolean, default: false },
  time: { type: Date },
  name: { type: String },
  url: { type: String },
  upload: uploadSchema,
  pipelines: { type: String },
  isPublic: { type: Boolean, default: false },
  expirationDate: { type: Date, default: undefined }
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

schema.pre('remove', async function removeFile(next) {
  if (this.upload) {
    try {
      const repo = factory(this.upload.repo);
      await repo.deleteFromPath(this.upload.key);
    } catch (err) {
      logger.error('models.download remove', err);
    }
  }
  next();
});

schema.pre('save', async function preSave(next) {
  if (!this.isNew) {
    next();
    return;
  }

  // whatever the ttl needs to be
  const expireSeconds = await getOrgExpireTTL(this.organisation);
  if (expireSeconds) {
    this.expirationDate = moment().add(expireSeconds, 'seconds').toDate();
  }

  next();
});

const Download = getConnection().model('Download', schema, 'downloads');
export default Download;
