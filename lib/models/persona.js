import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import _ from 'lodash';
// import PersonaIdentifier from '/lib/models/personaIdentifier'; // required to ensure population works!!! we also use it to create the ref
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import timestamps from 'mongoose-timestamp';
import 'string_score';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';

const schema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation', index: true },
  name: { type: String },
  personaIdentifiers: [{ type: mongoose.Schema.ObjectId, ref: 'PersonaIdentifier', default: [] }],
});
schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;
schema.plugin(timestamps);

schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

schema.index({ organisation: 1, personaIdentifiers: 1 });
schema.index({ organisation: 1, updatedAt: -1, _id: 1 });

const Persona = getConnection().model('Persona', schema, 'personas');
export default Persona;
