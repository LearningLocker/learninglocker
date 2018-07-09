import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import uploadSchema from 'lib/models/uploadSchema';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import { factory } from 'lib/services/files/storage';
import _ from 'lodash';

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
  isPublic: { type: Boolean, default: false }
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
      console.error('models.download remove', err);
    }
    console.log(this.upload);
  }
  next();
});

const Download = getConnection().model('Download', schema, 'downloads');
export default Download;
