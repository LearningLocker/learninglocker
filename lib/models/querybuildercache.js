import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import _ from 'lodash';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';

const schema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  path: [{ type: String, index: true }],
  searchString: { type: String },
  valueType: { type: String },
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(timestamps);
schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

schema.index({ organisation: 1, searchString: 1 }, { unique: true });
schema.index({ organisation: 1, path: 1, createdAt: -1, _id: 1 });

const QueryBuilderCache =
  getConnection().model('QueryBuilderCache', schema, 'queryBuilderCaches');
export default QueryBuilderCache;
