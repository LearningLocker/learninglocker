import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import { keys } from 'lodash';
import * as scopes from 'lib/constants/scopes';
import timestamps from 'mongoose-timestamp';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';

const schema = new mongoose.Schema({
  name: { type: String },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  isPublic: { type: Boolean, default: false },
});

schema.readScopes = keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(timestamps);
schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

export default getConnection().model('PersonasImportTemplate', schema, 'personasImportTemplates');
