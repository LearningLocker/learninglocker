import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import { defaultProjection } from 'lib/constants/exports';
import _ from 'lodash';

const schema = new mongoose.Schema({
  organisation: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organisation',
    index: true
  },
  name: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  projections: {
    type: [{ type: String }],
    default: [defaultProjection]
    // set doesn't work here
    // due to a dot notation issue with express-restify-mongoose and mixed type values
    // the value must be cast as a string on the client side before it is sent
    // get doesn't work here either
  },
  type: { type: String },
  rawMode: { type: Boolean, default: false },
  downloads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Download' }],
  isPublic: { type: Boolean, default: false }
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

const Export = getConnection().model('Export', schema, 'exports');
export default Export;
