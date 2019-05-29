import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import _ from 'lodash';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';

const schema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  name: { type: mongoose.Schema.Types.Mixed },
  searchString: { type: String }
});

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

const FullActivities =
  getConnection().model('FullActivities', schema, 'fullActivities');
export default FullActivities;
