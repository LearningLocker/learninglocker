import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import uploadSchema from 'lib/models/uploadSchema';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import { factory } from 'lib/services/files/storage';
import _ from 'lodash';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import logger from 'lib/logger';
import SiteSettings from './siteSettings';
import Organisation from './organisation';
import moment from 'moment';

const getExpireTTL = async (download) => {
  const organisationId = download.organisation;

  const [organisation, siteSettings] =
    await Promise.all([
      Organisation.findById(organisationId),
      SiteSettings.findById(SITE_SETTINGS_ID),
    ]);

  if (!siteSettings.expireExports) {
    return undefined;
  }

  if (!organisation.settings.EXPIRE_EXPORTS.expireExports) {
    return undefined;
  }

  return organisation.settings.EXPIRE_EXPORTS.ttl;
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
  const expireSeconds = await getExpireTTL(this);
  if (expireSeconds) {
    this.expirationDate = moment().add(expireSeconds, 'seconds').toDate();
  }

  next();
});

const Download = getConnection().model('Download', schema, 'downloads');
export default Download;
