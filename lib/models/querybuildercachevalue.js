import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import timestamps from 'mongoose-timestamp';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import _ from 'lodash';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';

const schema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  path: { type: String },
  hash: { type: String },
  value: { type: mongoose.Schema.Types.Mixed },
  display: { type: mongoose.Schema.Types.Mixed, default: null },
  valueType: { type: String },
  searchString: { type: String },
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(timestamps);
schema.plugin(scopeChecks);
schema.plugin(filterByOrg);

schema.plugin(addCRUDFunctions);
schema.index({ organisation: 1, path: 1, hash: 1 }, { unique: true });
schema.index({ organisation: 1, path: 1, updatedAt: -1, _id: 1 });

const QueryBuilderCache =
  getConnection().model('QueryBuilderCacheValue', schema, 'queryBuilderCacheValues');
export default QueryBuilderCache;
