import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import findOrCreate from 'mongoose-findorcreate';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import * as scopes from 'lib/constants/scopes';
import _ from 'lodash';
import titleCase from 'to-title-case';
import logger from 'lib/logger';
import timestamps from 'mongoose-timestamp';
import {
  STATEMENT_ACTOR_NAME,
  getUniqueIdentifierDisplayName
} from 'lib/constants/statements';

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

schema.pre('save', function handlePreSave(next) {
  this.personaChanged = this.isModified('persona');
  next();
});

schema.post('save', function handlePostSave(model, next) {
  if (this.personaChanged) { // set in the presave
    // if the persona linked to this identifier has changed,
    // update all statements that have this personaIdentifier
    return model.updatePersona(next);
  }
  next();
});

/**
 * Update statements to reference a persona
 * @param  {Function} next A callback on completion
 */
schema.methods.updatePersona = function updateStatementsandPersona(next) {
  // a query used to filter statements we will be updatingdb
  const Persona = getConnection().model('Persona');

  const statementUpdateQuery = {
    organisation: this.organisation,
    personaIdentifier: this._id
  };

  const clearPersonaOnStatements = (cb) => {
    const Statement = getConnection().model('Statement');

    Statement.update(
      statementUpdateQuery,
      { person: { _id: null, display: '' } },
      { multi: true }, cb);
  };

  try {
    const personaId = this.persona;
    if (!personaId) {
      // if no persona on model, clear the statements
      clearPersonaOnStatements(next);
    } else {
      Persona.findById(personaId, (err, persona) => {
        if (err) return next(err);
        // if this persona exists then update all statements to reference this person
        if (persona) {
          // remove from existing person if exists
          Persona.update(
            { personaIdentifiers: this._id },
            { $pull: { personaIdentifiers: this._id } },
            { multi: true }).exec((err) => {
              if (err) logger.error(err);
              // add to the new one
              Persona.update(
                { _id: persona._id },
                { $addToSet: { personaIdentifiers: this._id } }
              ).exec((err) => {
                if (err) logger.error(err);
                persona.assignToStatements(statementUpdateQuery, (err, raw) => {
                  next(err, raw);
                });
              });
            });
        } else {
          // if persona doesn't exist, clear the statements
          clearPersonaOnStatements(next);
        }
      });
    }
  } catch (err) {
    logger.error('Error trying to update persona across statements', err);
    next(err);
  }
};

/**
 * Use the identifiers to create a display name for this personaIdentifier
 * Used to place a name on the persona
 * @return {String} The name
 */
schema.methods.getDisplayName = function getDisplayName() {
  let name;
  const nameIdent = _.find(this.identifiers, ident => ident.key === STATEMENT_ACTOR_NAME);

  if (nameIdent) {
    name = titleCase(nameIdent.value);
  } else {
    name = getUniqueIdentifierDisplayName(this.uniqueIdentifier);
  }
  return name;
};

const PersonaIdentifier = getConnection().model(
  'PersonaIdentifier',
  schema,
  'personaidentifiers'
);
export default PersonaIdentifier;
