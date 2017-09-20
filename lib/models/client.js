import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import _ from 'lodash';
import crypto from 'crypto';
import { authority } from 'xapi-validation/dist/factory';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import timestamps from 'mongoose-timestamp';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';

function getRandString(len) {
  const string = crypto.randomBytes(Math.ceil(len / 2))
    .toString('hex') // convert to hexadecimal format
    .slice(0, len);
  return string;
}

function validateAuthority(value, respond) {
  const decodedValue = JSON.parse(value);
  const warnings = authority(decodedValue, ['authority']);
  if (Array.isArray(warnings) && warnings.length > 0) {
    respond(false, warnings.join(', '));
  } else {
    respond(true);
  }
}

const schema = new mongoose.Schema({
  title: { type: String },
  api: {
    basic_key: { type: String },
    basic_secret: { type: String }
  },
  authority: {
    type: String,
    get: val => (val ? JSON.parse(val) : {}),
    validate: validateAuthority,
    default: JSON.stringify({
      objectType: 'Agent',
      name: 'New Client',
      mbox: 'mailto:hello@learninglocker.net',
    })
  },
  isTrusted: { type: Boolean, default: true },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  lrs_id: { type: mongoose.Schema.ObjectId, ref: 'Lrs', index: true },
  scopes: { type: [String], enum: _.keys(scopes.CLIENT_SCOPES) }
}, {
  toObject: { getters: true },
  toJSON: { getters: true }
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = [scopes.ALL];
schema.plugin(timestamps);

schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

schema.pre('save', function preSave(next) {
  // set default api details
  if (!_.get(this.api, 'basic_key')) _.set(this.api, 'basic_key', getRandString(40));
  if (!_.get(this.api, 'basic_secret')) _.set(this.api, 'basic_secret', getRandString(40));

  next();
});

const Client = getConnection().model('Client', schema, 'client');
export default Client;
