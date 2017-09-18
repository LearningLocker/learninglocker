import _ from 'lodash';
import Promise from 'bluebird';
import Persona from 'lib/models/persona';
import LRS from 'lib/models/lrs';
import async from 'async';
import PersonaFinder from 'lib/classes/PersonaFinder';
import wrapHandlerForStatement from 'worker/handlers/statement/wrapHandlerForStatement';
import { STATEMENT_EXTRACT_PERSONAS_QUEUE } from 'lib/constants/statements';

export const getOrgId = (statement, done) => {
  const lrsId = statement.lrs_id;
  // get the orgId from the LRS the statement belongs to
  LRS.findById(lrsId, (err, org) => {
    if (!org || err) return done(new Error(`No LRS found for ${lrsId} for statement: ${statement._id}`));
    done(null, org.organisation);
  });
};

export const getIdentifiers = (statement, done) => {
  // get the identifiers from the doc
  if (!_.hasIn(statement, ['statement', 'actor'])) return done(new Error(`No actor found for statement: ${statement._id}`));
  const actor = _.get(statement, 'statement.actor', {});

  const idents = {
    xapi_id: _.get(actor, 'account.name'),
    xapi_name: _.get(actor, 'name'),
    xapi_home_page: _.get(actor, 'account.homePage'),
    xapi_mbox: _.get(actor, 'mbox'),
    xapi_openid: _.get(actor, 'openid'),
    xapi_mbox_sha1sum: _.get(actor, 'mbox_sha1sum')
  };

  done(null, idents);
};

export const setPersona = (identifiers, org, done) => {
  // either match the person or create a new person
  Persona.findTopScoring(org, identifiers, (person) => {
    const resultPersona = person || new Persona({ organisation: org });
    done(null, resultPersona);
  });
};

export const addIdentifiersToPersona = (identifiers, person, done) => {
  // add any new identifiers to the Persona
  _.each(identifiers, (value, key) => {
    if (value) person.addIdentifier(key, value);
  });

  person.save(done);
};

export const mergeSimilarPeople = (person, cb) => {
  const identifiers = _.reduce(person.identifiers, (memo, identifier) => {
    memo[identifier.key] = identifier.values;
    return memo;
  }, {});

  Persona.findTopScoring(person.organisation, identifiers, (matchedPersona) => {
    if (matchedPersona) {
      // merge together the idents from
      const newIdents = _.map(person.identifiers, (ident) => {
        const matchedIdent = _.find(matchedPersona.identifiers, subIdent =>
          subIdent.key === ident.key
        );
        const matchedValues = _.get(matchedIdent, 'values', []);
        ident.values = _.union(ident.values, matchedValues);
        return ident;
      });

      // save the changes and delete the duplicate
      async.series({
        updated: next => Persona.findByIdAndUpdate(
          person._id,
          { identifers: newIdents },
          { new: true },
          next
        ),
        removed: (next) => {
          console.log('PERSON ID', person._id);
          console.log('MATCHED ID', matchedPersona._id);
          console.log('MATCHING', person._id.equals(matchedPersona._id));
          if (person._id.equals(matchedPersona._id)) next();
          else matchedPersona.remove(next);
        }
      }, (err, results) => {
        console.log('UPDATED', results.updated.identifiers);
        return cb(err, results.updated);
      });
    } else {
      cb();
    }
  });
};

const handleStatement = (statement) => {
  const personaFinder = new PersonaFinder();
  return Promise.promisify(personaFinder.processStatementForPersona)(statement);
};

const handleStatements = (statements) => {
  if (_.isArray(statements)) {
    return Promise.all(_.map(statements, handleStatement));
  }
  return handleStatement(statements);
};

export const extractPersonasStatementHandler = (statements, done) => {
  handleStatements(statements).then(() => { done(null); }).catch(done);
};

// PROCESS START
export default wrapHandlerForStatement(
  STATEMENT_EXTRACT_PERSONAS_QUEUE,
  extractPersonasStatementHandler
);
