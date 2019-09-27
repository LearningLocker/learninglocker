import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import keys from 'lodash/keys';
import { getConnection } from 'lib/connections/mongoose';
import * as scopes from 'lib/constants/scopes';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import updateQueryBuilderCache from 'lib/services/importPersonas/updateQueryBuilderCache';

const schema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.Types.ObjectId, ref: 'Organisation', index: true },
  personaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Persona', index: true },
  key: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
});
schema.plugin(filterByOrg);
schema.plugin(timestamps);
schema.plugin(addCRUDFunctions);

schema.readScopes = keys(scopes.USER_SCOPES);
schema.writeScopes = [scopes.ALL];

schema.plugin(scopeChecks);

schema.pre('save', function preSave(next) {
  updateQueryBuilderCache({
    attributes: [this],
    organisation: this.organisation,
  });
  next();
});

export default getConnection().model('PersonaAttribute', schema, 'personaAttributes');
