import logger from 'lib/logger';
import assert from 'assert';
import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import _ from 'lodash';
import highland from 'highland';
import ScoringScheme from 'lib/models/scoringscheme';
import LRS from 'lib/models/lrs';
import Statement from 'lib/models/statement';
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

schema.pre('remove', async function handlePreRemove(next) {
  // $pull all personaScores where personaScores.persona = this._id
  const PersonaIdentifier = getConnection().model('PersonaIdentifier');

  PersonaIdentifier.update(
    { persona: this._id },
    { $set: { persona: null } },
    { upsert: false, multi: true }
  ).then(() => next()).catch(next);

  PersonaIdentifier.update(
    { 'personaScores.persona': this._id },
    { $pull: { personaScores: { persona: this._id } } },
    { upsert: false, multi: true }
  ).catch(logger.error);
  Statement.update(
    { 'person._id': this._id },
    { person: { _id: null, display: '' } },
    { multi: true }
  ).catch(logger.error);
});

schema.methods.addIdentifier = function addIdentifier(key, value) {
  const identifier = _.find(this.identifiers, { key });

  // add the given value to an identifier with the given key
  if (identifier) identifier.values = _.union(identifier.values, [value]);
  // create a new identifier if there isn't one with the key already
  else this.identifiers.push({ key, values: [value] });
};

schema.methods.getIdentifierKeys = function getIdentifierKeys() {
  const keys = _.pluck(this.identifiers, 'keys');
  return keys;
};

schema.methods.getIdentifierValues = function getIdentifierValues() {
  const values = _.pluck(this.identifiers, 'values');
  return _.flatten(values);
};

schema.methods.scoreAgainstData = function scoreAgainstData(keyValues, scoringScheme) {
  // matches the person against the given data and returns an array of scores
  const self = this;

  return _.map(keyValues, (value, key) => {
    const values = _.isArray(value) ? value : [value];

    const result = _.max(_.map(values, (val) => {
      let score = 0;
      if (val) {
        // match the val against every saved val we have for this person
        const identifier = _.find(self.identifiers, { key });

        if (identifier) {
          const weight = _.get(scoringScheme, ['keys', key], 0);

          const maxScore = _.max(_.map(identifier.values, (identValue) => {
            try {
              return identValue.score(val);
            } catch (e) {
              logger.error(e);
              return null;
            }
          }));

          score = Math.round(maxScore * weight);
        }
      }
      return score;
    }));

    return result;
  });
};

/**
 * Updates all the statements that match a query criteria with the persona _id and name
 * @param  {Object}   statementUpdateQuery A query to run the statement batch update on
 * @param  {Function} next                 Callback on completion, with error if applic.
 */
schema.methods.assignToStatements = function assignToStatements(statementUpdateQuery, next) {
  try {
    const statementPersona = {
      _id: this._id,
      display: this.name
    };

    // ensure cross organisation pollination does not happen!
    statementUpdateQuery.organisation = this.organisation;
    Statement.update(statementUpdateQuery, { person: statementPersona }, { multi: true }, next);
  } catch (err) {
    next(err);
  }
};


schema.statics.saveStatementRelation = function saveStatementRelation(id, personId, cb) {
  this.findById(personId, (err, persona) => {
    if (!persona) return cb();
    assert.ifError(err);
    Statement.findById(id, (err, statement) => {
      assert.ifError(err);
      if (statement) {
        let personaDisplay = '';
        try {
          const { identifiers } = persona;
          if (_.find(identifiers, { key: 'xapi_name' })) personaDisplay = _.find(persona.identifiers, { key: 'xapi_name' });
          else if (_.find(identifiers, { key: 'xapi_id' })) personaDisplay = _.find(persona.identifiers, { key: 'xapi_id' });
          else if (_.find(identifiers, { key: 'xapi_mbox' })) personaDisplay = _.find(persona.identifiers, { key: 'xapi_mbox' });

          statement.person = {
            _id: persona._id,
            display: _.get(personaDisplay, ['values', 0])
          };

          statement.save((err) => {
            if (err) logger.error(err);
            cb();
          });
        } catch (e) {
          cb(e);
        }
      } else {
        cb();
      }
    });
  });
};

schema.statics.findTopScoring = function findTopScoring(organisation, keyValues, cb) {
  const self = this;

  // finds the top scoring people for the given lrs and keyValues
  ScoringScheme.findOrCreate({ organisation }, (err, scoringScheme) => {
    assert.ifError(err);

    // stream the people from this org to find the one with the highest score
    const stream = highland(self.find({ organisation })
      .sort({ updatedAt: -1 })
      .stream())
      .map((persona) => {
        let totalScore = 0;
        totalScore = _.map(persona.scoreAgainstData(keyValues, scoringScheme), (score) => {
          totalScore += score;
          return totalScore;
        });
        const score = _.maxBy(totalScore);
        persona.score = score;
        return persona;
      })
      .filter(persona => persona.score >= scoringScheme.targetScore)
      .flatten();

    cb(stream);
  });
};

schema.statics.filterByClient = function filterByClient(client, cb) {
  const self = this;
  LRS.filterByClient(client, (query) => {
    query.exec((err, lrsList) => {
      const lrsIds = _.pluck(lrsList, '_id');
      cb(self.find({ lrs_id: { $in: lrsIds } }));
    });
  });
};

const Persona = getConnection().model('Persona', schema, 'personas');
export default Persona;

// think about making whole pipeline configurable rather than just weights
