import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import _ from 'lodash';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import timestamps from 'mongoose-timestamp';
import * as scopes from 'lib/constants/scopes';

const schema = new mongoose.Schema({
  importModel: { type: mongoose.Schema.ObjectId, ref: 'Import', index: true },
  data: { type: Array, default: [] }
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = [scopes.ALL];
schema.plugin(timestamps);

schema.plugin(scopeChecks);
schema.plugin(filterByOrg);

const ImportData = getConnection().model('ImportData', schema, 'importdata');
export default ImportData;
