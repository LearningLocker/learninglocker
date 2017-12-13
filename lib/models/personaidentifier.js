import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import findOrCreate from 'mongoose-findorcreate';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import * as scopes from 'lib/constants/scopes';
import _ from 'lodash';
import timestamps from 'mongoose-timestamp';

const IdentSchema = new mongoose.Schema({
  value: { type: mongoose.Schema.Types.Mixed },
  key: { type: String }
}, { _id: false });


const MatchIdentSchema = new mongoose.Schema({
  value: { type: mongoose.Schema.Types.Mixed },
  comparedValue: { type: mongoose.Schema.Types.Mixed },
  key: { type: String },
  score: { type: Number }
}, { _id: false });

const PersonaScoreSchema = new mongoose.Schema({
  persona: { type: mongoose.Schema.ObjectId, ref: 'Persona' },
  score: { type: Number, default: 0 },
  matches: [MatchIdentSchema]
});

const schema = new mongoose.Schema({
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  uniqueIdentifier: IdentSchema,
  identifiers: [IdentSchema],
  persona: { type: mongoose.Schema.ObjectId, ref: 'Persona' },
  personaScores: { type: [PersonaScoreSchema] }
});

schema.index({ organisation: 1 });
schema.index({ organisation: 1, persona: 1 });
schema.index({ organisation: 1, uniqueIdentifier: 1 }, { unique: true });
schema.index({ organisation: 1, identifiers: 1 });
schema.index({ 'identifiers.key': 1, 'identifiers.value': 1 });

schema.readScopes = _.keys(scopes.USER_SCOPES);
schema.writeScopes = schema.readScopes;

schema.plugin(timestamps);
schema.plugin(scopeChecks);
schema.plugin(findOrCreate);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

const PersonaIdentifier = getConnection().model(
  'PersonaIdentifier',
  schema,
  'personaidentifiers'
);
export default PersonaIdentifier;
