import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import _ from 'lodash';

const outcomeSchema = new mongoose.Schema({
  description: { type: String },
  isActive: { type: Boolean, default: true },
  callback: { type: String },
  type: { type: String }
});

const schema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  hash: { type: String },
  description: { type: String },
  outcomes: { type: [outcomeSchema] },
  conditions: { type: String }
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(scopeChecks);
schema.plugin(filterByOrg);


const Stream = getConnection().model('Stream', schema, 'streams');
export default Stream;
