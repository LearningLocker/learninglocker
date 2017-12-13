import _ from 'lodash';
import Statement from 'lib/models/statement';
import Persona from 'lib/models/persona';
import PersonaIdentifier from 'lib/models/personaidentifier';
import ScoringScheme from 'lib/models/scoringscheme';
import {
  IDENTIFIABLE_STATEMENT_KEYS,
  SCORABLE_KEY_SETTINGS,
  STATEMENT_ACTOR_MBOX,
  STATEMENT_ACTOR_ACCOUNT,
  STATEMENT_ACTOR_SHA1SUM,
  STATEMENT_ACTOR_OPENID
} from 'lib/constants/statements';
import { addIdentsToCache } from 'lib/services/querybuildercache';
import async from 'async';
import logger from 'lib/logger';
import stringScore from 'string-score';
import boolean from 'boolean';

const DISABLE_PERSONA_SCORING = boolean(_.defaultTo(process.env.DISABLE_PERSONA_SCORING, true));

/**
 * HANDLES THE DISCOVERY OF PERSONAS AND ASSIGNMENT OF THEIR IDENTITIES
 */
export default class PersonaFinder {
  scoringScheme: null;
  scorableIdentKeys: null;

  /**
   * Return the scoringScheme for an organisation
   * Insert a new one if it doesn't exist
   * @param  {Organisation}   organisation
   * @param  {Function} next
   */
  getScoringScheme = (organisation, next) => {
    if (this.scoringScheme) return next(null, this.scoringScheme);

    ScoringScheme.findOne({ organisation }, (err, scoringScheme) => {
      if (err) return next(err);
      if (scoringScheme) {
        this.setScoringSchema(scoringScheme, next);
      } else {
        new ScoringScheme({ organisation }).save((err, seededScoringScheme) => {
          if (err) return next(err);
          this.setScoringSchema(seededScoringScheme, next);
        });
      }
    });
  };

  /**
   * Set the scoring scheme into the var and pass it to a callback
   * @param  {ScoringScheme} scoringScheme A mongoose scoringScheme
   * @param  {Function} next          [description]
   */
  setScoringSchema = (scoringScheme, next) => {
    this.scoringScheme = scoringScheme;
    next(null, this.scoringScheme);
  };

  /**
   * Return an object of the scores for each identifier key
   * @param  {ScoringScheme} scoringScheme A mongoose scoringScheme
   * @return {Object}        Object where the identifier key is the key of the object and the score is the value
   */
  getScorableIdentKeys = (scoringScheme) => {
    if (this.scorableIdentKeys) return this.scorableIdentKeys;

    this.scorableIdentKeys = _.reduce(
      scoringScheme.scoredIdents,
      (result, ident) => {
        result[ident.key] = ident.score;
        return result;
      },
      {}
    );
    return this.scorableIdentKeys;
  };

  getIdentValueForScoring = (ident) => {
    const keyScoreSetting = SCORABLE_KEY_SETTINGS[ident.key] || {};

    const valueTransformer = keyScoreSetting.valueTransformer || null;
    if (valueTransformer) {
      return valueTransformer(ident.value);
    }
    return ident.value;
  };

  /**
   * Process a statement
   * @param  {Function} done      A function to be called on completion
   * @param  {PersonaFinder~handlePersonaIdentifierForStatementCallback} next
   */
  processStatementForPersona = (statement, done) => {
    if (!statement) {
      return done(new Error('No statement available to process'));
    }

    if (statement.statement.actor.objectType !== 'Agent') {
      return done(null);
    }

    async.waterfall(
      [
        next => this.getPersonaIdentifierFromStatement(statement, next),
        (data, next) => this.assignPersonaIdentifierToStatement(data, next),
        (data, next) => this.handlePersonaIdentifierForStatement(data, next)
      ],
      (err, results) => {
        if (err) {
          logger.error(err);
          return done(err);
        }
        // const {
        //   personaIdentifier,
        //   matchedPersona,
        //   suggestedPersonas,
        //   statement
        // } = results;
        done(null, results);
      }
    );
  };

  /**
   * takes a statement and returns the a matching personaIdentifier
   * @param  {Statement} statement         A statement object
   * @param  {PersonaFinder~getPersonaIdentifierFromStatementCallback} next
   * @return {
   *   personaIdentifier,                  the matching personaIdentifier
   *   statement,                          the statement after any modifications
   * }
   */
  getPersonaIdentifierFromStatement = (statement, next) => {
    if (!statement.organisation) {
      return next(new Error('No organisation set'));
    }

    // first get the unique identifier
    return this.getUniqueIdentifierFromStatement(statement, (err, uniqueIdentifier) => {
      if (err) return next(err);
      if (!uniqueIdentifier) {
        logger.verbose('Failed on ', statement);
        return next(new Error('Expected a uniqueIdentifier to be found in  statement'));
      }

      return this.getOtherIdentifiersFromStatement(statement, (err, otherIdentifiers) => {
        if (err) return next(err);
        return this.findOrCreatePersonaIdentifier(
          statement.organisation,
          uniqueIdentifier,
          otherIdentifiers,
          (err, personaIdentifier) => {
            if (err) return next(err);
            if (!personaIdentifier) {
              return next(new Error('Expected a personaIdentifier to be found or created'));
            }
            return next(null, { personaIdentifier, statement });
          }
        );
      });
    });
  };

  /**
   * @callback PersonaFinder~getIdentifiersFromStatementCallback
   * @param {Error} An error if available
   * @param {Object}  {personaIdentifier, statement}
   */

  valsToLowerCase = (value, key) => {
    const keySetting = SCORABLE_KEY_SETTINGS[key] || { caseSensitive: false };
    let newValue = value;
    if (typeof value === 'string' && !keySetting.caseSensitive) {
      newValue = value.toLowerCase();
    } else if (Array.isArray(value)) {
      newValue = _.map(value, (val, innerkey) => this.valsToLowerCase(val, `${key}.${innerkey}`));
    } else if (_.isPlainObject(value)) {
      const orderedKeysValue = Object.keys(value).sort().reduce((o, k) => {
        o[k] = value[k];
        return o;
      }, {});
      newValue = _.mapValues(orderedKeysValue, (innerval, innerkey) =>
        this.valsToLowerCase(innerval, `${key}.${innerkey}`)
      );
    }

    if (typeof newValue === 'string') {
      newValue = newValue.trim();
    }
    return newValue;
  };

  /**
    * Create an ident, with a lowercased value if required
    * @param  {[type]} key   [description]
    * @param  {[type]} value [description]
    * @return {[type]}       [description]
    */
  makeIdent = (key, value) => ({
    key,
    value: this.valsToLowerCase(value, key)
  });

  /**
   * Parses a statement object to return an object containing a unique identifier for the statement
   * Each includes an identifying `value` and the namespace of the value as `key`
   * @param  {Statement}   statement The statement to parse
   * @param  {PersonaFinder~getUniqueIdentifierFromStatementCallback} next
   */
  getUniqueIdentifierFromStatement = (statement, next) => {
    let identifier = null;

    if (!statement || !statement.statement) {
      return next(new Error('No statement passed'), []);
    }

    if (statement.statement.actor) {
      if (statement.statement.actor.mbox) {
        identifier = this.makeIdent(STATEMENT_ACTOR_MBOX, statement.statement.actor.mbox);
      }
      if (statement.statement.actor.mbox_sha1sum) {
        identifier = this.makeIdent(
          STATEMENT_ACTOR_SHA1SUM,
          statement.statement.actor.mbox_sha1sum
        );
      }
      if (statement.statement.actor.account) {
        identifier = this.makeIdent(STATEMENT_ACTOR_ACCOUNT, statement.statement.actor.account);
      }
      if (statement.statement.actor.openid) {
        identifier = this.makeIdent(STATEMENT_ACTOR_OPENID, statement.statement.actor.openid);
      }
    }

    next(null, identifier);
  };
  /**
   * @callback PersonaFinder~getUniqueIdentifierFromStatementCallback
   * @param {Error} An error if available
   * @param {Object}  A unique identifiers
   */

  /**
   * Parses a statement object to return an array of non -unique identifiers for the statement
   * Each includes an identifying `value` and the namespace of the value as `key`
   * @param  {Statement}   statement The statement to parse
   * @param  {PersonaFinder~getOtherIdentifiersFromStatementCallback} next
   */
  getOtherIdentifiersFromStatement = (statement, next) => {
    if (!statement || !statement.statement) {
      return next(new Error('No statement passed'), []);
    }

    statement = statement instanceof Statement ? statement.toObject() : statement;

    this.getScoringScheme(statement.organisation, (err, scoringScheme) => {
      if (err) return next(err);
      this.getOtherIdentsFromObject(statement, scoringScheme, next);
    });
  };
  /**
   * @callback PersonaFinder~getOtherIdentifiersFromStatementCallback
   * @param {Error} An error if available
   * @param {Array}  Array of identifiers
   */

  /**
    * Takes an object and discovers all valid idents in it
    * @param  {Object}   identObject
    * @param  {scoringScheme}   scoringScheme
    * @param  {Function} next
    */
  getOtherIdentsFromObject = (identObject, scoringScheme, next) => {
    const identifiers = [];
    if (!scoringScheme || !scoringScheme.scoredIdents || scoringScheme.scoredIdents.length === 0) {
      return next(new Error('No scoring scheme for organisation'));
    }

    // loop through all the scoring schema keys
    const scoredIdents = scoringScheme.scoredIdents;
    _.each(scoredIdents, (scoredIdent) => {
      const key = scoredIdent.key;

      // check the value exists
      if (_.has(identObject, key)) {
        const value = _.get(identObject, key, null);
        if (value) {
          // place it into the array!
          identifiers.push(this.makeIdent(key, value));
        }
      }
    });
    next(null, identifiers);
  };

  /**
   * takes an array of person identifiers
   * @param  {Object}   uniqueIdentifiers         A single unique ident
   * @param  {array}   otherIdentifiers         Array of other non-unique identifiers
   * @param  {PersonaFinder~findOrCreatePersonaIdentifierCallback} next
   * @return {
   *   error                         Error (if any)
   *   personaIdentifier             The personaIdentifier (either found or created) populated with the persona
   * }
   */
  findOrCreatePersonaIdentifier = (organisation, uniqueIdentifier, otherIdentifiers, next) => {
    const identifiers = otherIdentifiers || [];

    PersonaIdentifier.findOneAndUpdate(
      { organisation, uniqueIdentifier },
      { $addToSet: { identifiers: { $each: identifiers } } },
      { new: true, upsert: true, passRawResult: true }
    ).exec((err, model, res) => {
      if (err) {
        if (err.code === 11000) {
          return this.findOrCreatePersonaIdentifier(
            organisation,
            uniqueIdentifier,
            otherIdentifiers,
            next
          );
        }
        return next(err);
      }
      const isExisting = !!res.lastErrorObject.updatedExisting;
      model.isExisting = isExisting;
      addIdentsToCache(organisation, identifiers)
        .then(() => next(null, model))
        .catch(err => next(err));
    });
  };
  /**
   * @callback PersonaFinder~findOrCreatePersonaIdentifierCallback
   * @param {Error} An error if available
   * @param {PersonaIdentifier}  personaIdentifier
   */

  /**
   * Takes a personaIdentifier and a statement and tries to reconcile them to a persona
   * @param  {PersonaIdentifier}   personaIdentifier  a personaIdentifier model
   * @param  {Statement}           statement          the corresponding statement
   * @param  {PersonaFinder~handlePersonaIdentifierForStatementCallback} next
   */
  handlePersonaIdentifierForStatement = ({ personaIdentifier, statement }, next) => {
    if (!personaIdentifier) {
      return next(new Error('Expected personaIdentifier'));
    }
    if (!statement) return next(new Error('Expected statement'));
    if (personaIdentifier.persona) {
      // check the persona actually exists
      personaIdentifier.populate('persona', (err, populatedPersonaIdentifier) => {
        if (err) return next(err);
        // if personaIdentifier has persona
        if (populatedPersonaIdentifier.persona) {
          // assign this persona onto the statement
          this.assignPersonaToStatement(
            {
              statement,
              persona: populatedPersonaIdentifier.persona,
              personaIdentifier
            },
            (err, assignData) => {
              if (err) return next(err);
              next(null, {
                persona: assignData.persona,
                personaIdentifier: assignData.personaIdentifier,
                statement: assignData.statement
              });
            }
          );
        } else {
          // if we can't find the persona, clean up the personaIdentifier
          personaIdentifier.persona = null;
          personaIdentifier.save((err, updatedPersonaIdentifier) => {
            // can't find a person so go look for one
            this.handlePersonaIdentifierWithNoPersona(
              { personaIdentifier: updatedPersonaIdentifier },
              (err, handleData) => {
                if (err) return next(err);
                next(null, {
                  persona: handleData.persona,
                  personaIdentifier: handleData.personaIdentifier,
                  statement
                });
              }
            );
          });
        }
      });
    } else {
      // can't find a person so go look for one
      this.handlePersonaIdentifierWithNoPersona({ personaIdentifier }, (err, handleData) => {
        if (err) return next(err);
        next(null, {
          persona: handleData.persona,
          personaIdentifier: handleData.personaIdentifier,
          statement
        });
      });
    }
  };
  /**
   * @callback PersonaFinder~handlePersonaIdentifierForStatementCallback
   * @param {Error} An error if available
   * @param {Object}  {persona, personaIdentifier, statement}
   */

  /**
    * Takes a personaIdentifier and attempts to score it against a lone persona
    * This is useful when we have merged two personas and want to rescore suggestedPersonas
    * @param  {PersonaIdentifier, Persona}   personaIdentifier  a personaIdentifier model
    * @param  {PersonaFinder~handlePersonaCallback} next
    */
  handlePersonaIdentifierForPersona = ({ personaIdentifier, persona }, next) => {
    // assume this is an existing personaIdentifier, this prevents inserts of new personas
    personaIdentifier.isExisting = true;
    // go search for a persona using this personaIdentifier
    this.getScoredForAssumedPersona(personaIdentifier, persona, (err, data) => {
      if (err) return next(err);
      this.handleScoredData(personaIdentifier, data, next);
    });
  };

  /**
   * Takes a personaIdentifier with no persona and attempts to match to an existing one
   * If that fails, then move onto setting suggestedPersonas
   * @param  {PersonaIdentifier}   personaIdentifier  a personaIdentifier model
   * @param  {PersonaFinder~handlePersonaCallback} next
   */
  handlePersonaIdentifierWithNoPersona = ({ personaIdentifier }, next) => {
    // go search for a persona using this personaIdentifier
    this.getPersonaFromPersonaIdentifier(personaIdentifier, (err, data) => {
      if (err) return next(err);
      this.handleScoredData(personaIdentifier, data, next);
    });
  };
  /**
   * @callback PersonaFinder~handlePersonaCallback
   * @param {Error} An error if available
   * @param {Object}  {persona, personaIdentifier}
   */

  /**
    * Takes a scoring data and assign matched or suggested personas as required
    * If that fails, then move onto setting suggestedPersonas
    * @param  {PersonaIdentifier}   personaIdentifier  a personaIdentifier model
    * @param  {PersonaFinder~handlePersonaCallback} next
    */
  handleScoredData = (personaIdentifier, data, next) => {
    if (data.matchedPersona) {
      logger.debug('Found a matchedPersona: assign persona to personaIdentifier', {
        persona: data.matchedPersona.persona._id.toString(),
        personaIdentifier: personaIdentifier._id.toString()
      });
      // assign the persona to the personaIdentifier
      this.assignPersonaToPersonaIdentifier(
        { persona: data.matchedPersona.persona, personaIdentifier },
        (err, assignData) => {
          if (err) return next(err);
          next(null, assignData);
        }
      );
    } else if (data.suggestedPersonas && data.suggestedPersonas.length > 0) {
      logger.debug(`Found ${data.suggestedPersonas.length} suggestedPersonas`, {
        personaIdentifier: personaIdentifier._id.toString()
      });
      //   if we have an array of suggestedPersonas push them into the personaIdentifier
      this.assignSuggestedPersonasToPersonaIdentifier(
        { personaIdentifier, suggestedPersonas: data.suggestedPersonas },
        (err, updatedPersonaIdentifier) => {
          if (err) return next(err);
          next(null, {
            persona: null,
            personaIdentifier: updatedPersonaIdentifier
          });
        }
      );
    } else {
      logger.debug('No match or suggestions, make the person');
      // if a new personaIdentifier was created in this flow, make a new persona
      if (personaIdentifier.isExisting) {
        logger.debug(
          `personaIdentifier ${personaIdentifier._id} marked as existing; we assume the creator added a persona already`
        );
        // should get picked up another time....
        next(null, { persona: null, personaIdentifier });
      } else {
        logger.debug('Creating a persona for this personaIdentifier', {
          personaIdentifier: personaIdentifier._id.toString()
        });
        // if we didn't find a person, the personaIdentifier IS new and we couldn't find any loose matches...
        // make a new persona!
        this.createPersonaFromPersonaIdentifier(personaIdentifier, (err, createdPersonaData) => {
          if (err) return next(err);
          next(null, {
            persona: createdPersonaData.persona,
            personaIdentifier: createdPersonaData.personaIdentifier
          });
          // @todo: checkForSimilarFromAttachedPersonaIdentifier(updatedPersonaIdentifier)
        });
      }
    }
  };

  /**
   * Assigns a person to a personaIdentifier
   * Post save hooks will deal with assigning other statements with this personaIdentifier to the new persona
   * @param  {Persona}           persona              The persona to assign to
   * @param  {PersonaIdentifier} personaIdentifier    The personaIdentifier we are assigning
   * @param  {PersonaFinder~assignPersonaToPersonaIdentifierCallback}          next
   */
  assignPersonaToPersonaIdentifier = ({ persona, personaIdentifier }, next) => {
    // only assign the persona if it doesnt already have the assignment
    if (
      !personaIdentifier.persona ||
      (personaIdentifier.persona && personaIdentifier.persona.toString() !== persona._id.toString())
    ) {
      logger.debug(
        `Assigning personaIdentifier ${personaIdentifier._id.toString()} to persona ${persona._id.toString()}`
      );
      personaIdentifier.persona = persona._id;
      personaIdentifier.save((err, updatedPersonaIdentifier) => {
        if (err && err.name === 'VersionError') {
          // if we hit a version error, its prob cause of simulateneous saves!!!!!
          logger.silly('VersionError on personaIdentifier save');
          this.assignPersonaToPersonaIdentifier({ persona, personaIdentifier }, next);
        } else {
          if (err) return next(err);
          // The personaIdentifier model save hooks will take care of associating relevant statements back to the persona
          next(err, { personaIdentifier: updatedPersonaIdentifier, persona });
        }
      });
    } else {
      logger.debug(
        `PersonaIdentifier ${personaIdentifier._id.toString()} already assigned with persona ${persona._id.toString()}`
      );
      next(null, { persona, personaIdentifier });
    }
  };
  /**
   * @callback PersonaFinder~assignPersonaToPersonaIdentifierCallback
   * @param {Error} An error if available
   * @param {Object}  {persona, personaIdentifier}
   */

  /**
   * Assigns the given persona to the given statement
   * @param  {Statement}            statement A statement object
   * @param  {Persona}              persona A persona object
   * @param  {PersonaIdentifier}    personaIdentifier A personaIdentifier object
   * @param  {PersonaFinder~assignPersonaToStatementCallback} next
   */
  assignPersonaToStatement = ({ statement, persona, personaIdentifier }, next) => {
    // update the statement with a person id
    // remove the statement id from the personaIdentifier
    const updateData = {
      person: { _id: persona._id, display: persona.name },
      personaIdentifier: personaIdentifier._id
    };
    Statement.findOneAndUpdate(
      { _id: statement._id },
      { $set: updateData },
      { new: true },
      (err, updatedStatement) => {
        if (err) return next(err);
        return next(null, {
          statement: updatedStatement,
          personaIdentifier,
          persona
        });
      }
    );
  };
  /**
   * @callback PersonaFinder~assignPersonaToStatementCallback
   * @param {Error} An error if available
   * @param {Object}  {statement, persona, personaIdentifier}
   */

  /**
   * Assigns the given statement to the given persona identifier
   * @param  {PersonaIdentifier}    personaIdentifier A personaIdentifier object
   * @param  {Statement}            statement A statement object
   * @param  {PersonaFinder~assignPersonaIdentifierToStatementCallback} next
   * }
   */
  assignPersonaIdentifierToStatement = ({ personaIdentifier, statement }, next) => {
    // add the statement ID to the personaIdentifier's array of statements
    Statement.findOneAndUpdate(
      { _id: statement._id },
      { $set: { personaIdentifier: personaIdentifier._id } },
      { new: true },
      (err, updatedStatement) => {
        if (err) return next(err);
        next(null, { statement: updatedStatement, personaIdentifier });
      }
    );
  };
  /**
   * @callback PersonaFinder~assignPersonaIdentifierToStatementCallback
   * @param {Error} An error if available
   * @param {Object}  {statement, personaIdentifier}
   */

  /**
   * Attempts to get scoring data from all personaIdentifiers that have matching ident keys
   * @param  {PersonaIdentifier}    personaIdentifier A personaIdentifier object
   * @param  {PersonaFinder~scoreFoundPersonaIdentifiersCallback} next
   */
  getScoredFromAllPersonaIdents = (personaIdentifier, next) => {
    this.findRelatedPersonaIdentifiers(personaIdentifier, (err, models) => {
      if (err) return next(err);
      this.scoreFoundPersonaIdentifiers(models, personaIdentifier, next);
    });
  };

  /**
    * Attempts to (re)score a personaIdentifier using only idents found in the given persona
    * This can happen as a result of a merge deleting a persona, and all of its related suggestedPersonas needing rescoring
    * @param  {PersonaIdentifier}    personaIdentifier A personaIdentifier object
    * @param  {Persona}              persona A persona object
    * @param  {PersonaFinder~scoreFoundPersonaIdentifiersCallback} next
    */
  getScoredForAssumedPersona = (personaIdentifier, persona, next) => {
    PersonaIdentifier.find(
      {
        persona: persona._id,
        _id: { $ne: personaIdentifier._id },
        organisation: personaIdentifier.organisation
      },
      (err, models) => {
        if (err) return next(err);
        this.scoreFoundPersonaIdentifiers(models, personaIdentifier, next);
      }
    );
  };

  /**
   * Tries increasingly intensive methods to find either a matching persona or a set of suggested personas
   * @param  {PersonaIdentifier}   personaIdentifier A personaIdentifier object
   * @param  {PersonaFinder~getPersonaFromPersonaIdentifierCallback} next
   */
  getPersonaFromPersonaIdentifier = (personaIdentifier, next) => {
    if (personaIdentifier.persona) {
      Persona.findById(personaIdentifier.persona, (err, matchedPersona) => {
        if (err) return next(err);
        if (matchedPersona) {
          next(null, {
            personaIdentifier,
            matchedPersona: { persona: matchedPersona, matches: [] },
            suggestedPersonas: []
          });
        } else {
          // otherwise lets go score!
          if (DISABLE_PERSONA_SCORING) {
            return next(null, {
              personaIdentifier,
              matchedPersona: null,
              suggestedPersonas: []
            });
          }
          this.getScoredFromAllPersonaIdents(personaIdentifier, next);
        }
      });
    } else {
      // otherwise lets go score!
      if (DISABLE_PERSONA_SCORING) {
        return next(null, {
          personaIdentifier,
          matchedPersona: null,
          suggestedPersonas: []
        });
      }
      // otherwise lets go score!
      this.getScoredFromAllPersonaIdents(personaIdentifier, next);
    }
  };
  /**
   * @callback PersonaFinder~getPersonaFromPersonaIdentifierCallback
   * @param {Error} An error if available
   * @param {Object}  {personaIdentifier, matchedPersona, suggestedPersonas}
   */

  /**
   * Does a direct database lookup on personaIdentifiers which have personas
   * where an exact match is enough to pass the threshold
   * @param  {PersonaIdentifier}   personaIdentifier A personaIdentifier object
   * @param  {PersonaFinder~getPersonaFromUniqueIdentifiersCallback} next
   */
  getPersonaFromOtherIdentifiers = (personaIdentifier, next) => {
    if (!personaIdentifier || !personaIdentifier.identifiers) {
      return next(new Error('No identifiers on personaIdentifier'));
    }

    // go find other matching persona identifiers that HAVE a persona attached
    const identQueries = this.matchingPersonaIdentifiersQuery(personaIdentifier);
    if (!identQueries) {
      // no valid idents found
      return next(null, { personaIdentifier, matchedPersona: null });
    }

    const query = {
      organisation: personaIdentifier.organisation,
      $or: identQueries,
      persona: {
        $ne: null
      }
    };

    PersonaIdentifier.find(query, (err, models) => {
      if (err) return next(err);
      let persona = null;

      for (const model of models) {
        if (model && model.persona) {
          persona = model.persona;
          break;
        }
      }

      // // go fetch it
      if (persona) {
        Persona.findById(persona, (err, personaModel) => {
          if (err) return next(err);
          return next(null, {
            personaIdentifier,
            matchedPersona: personaModel
          });
        });
      } else {
        return next(null, { personaIdentifier, matchedPersona: null });
      }
    });
  };
  /**
   * @callback PersonaFinder~getPersonaFromUniqueIdentifiersCallback
   * @param {Error} An error if available
   * @param {Object}  {personaIdentifier, matchedPersona}
   */

  /**
   * Create a query for personaIdentifiers for finding other personaIdentifiers that have at least one identifiable value
   * @param  {PersonaIdentifier}   personaIdentifier [description]
   * @param  {Function} next              [description]
   * @return {Mixed} An object containing the query items, or false if no valid identifiers
   */
  matchingPersonaIdentifiersQuery = (personaIdentifier) => {
    const validIdentifiers = _.filter(personaIdentifier.identifiers, ident =>
      _.includes(IDENTIFIABLE_STATEMENT_KEYS, ident.key)
    );
    if (validIdentifiers.length === 0) {
      return false;
    }

    const query = _.map(validIdentifiers, (ident) => {
      const elemMatch = { key: ident.key };
      if (ident.key === STATEMENT_ACTOR_ACCOUNT) {
        elemMatch['value.name'] = ident.value.name || null;
        elemMatch['value.homePage'] = ident.value.homePage || null;
      } else {
        elemMatch.value = ident.value;
      }

      return {
        identifiers: {
          $elemMatch: elemMatch
        }
      };
    });

    return query;
  };

  /**
   * Returns either the first persona with a score past the matching threshold or an array of suggestedPersonas
   * @param  {PersonaIdentifier}   personaIdentifier A personaIdentifier object
   * @param  {PersonaFinder~scoreFoundPersonaIdentifiersCallback} next
   */
  findRelatedPersonaIdentifiers = (personaIdentifier, next) => {
    // stream personas and score each one until we come to the end of the stream or find a good match
    this.getScoringScheme(personaIdentifier.organisation, (err, scoringScheme) => {
      if (err) return next(err);
      // get the scored keys and map them to an object where each key is the key and the score is the value
      const scorableIdentKeys = this.getScorableIdentKeys(scoringScheme);

      // search for all personaIdentifiers that have an identifier listed in the scoring set
      const identQueries = [];

      const addScorableIdentsToQuery = function checkIdent(ident) {
        // create a query for valid keys in the unique ident
        if (_.has(ident, 'key')) {
          // loop through all the scorable ident keys
          const identQuery = {};

          _.each(scorableIdentKeys, (val, scorableKey) => {
            let searchValue = null;
            if (scorableKey === ident.key) {
              // if the unique idents key is in the scorableIdentKeys
              searchValue = _.pick(ident, ['key']);

              // set the type of search based on whether or not we are looking in an array of values
              identQuery.identifiers = {
                $elemMatch: searchValue
              };
              identQueries.push(identQuery);
            }
          });
        }
      };

      logger.silly(
        'Looking for similar personaIdentifiers to:',
        personaIdentifier.toJSON().identifiers
      );
      _.each(personaIdentifier.toJSON().identifiers, (otherIdent) => {
        addScorableIdentsToQuery(otherIdent);
      });

      // if we don't have any identifiers to try matching on, move on
      if (identQueries.length === 0) {
        return next(null, []);
      }

      // otherwise contstruct a query to go searching!
      const query = {
        $or: identQueries,
        persona: {
          $ne: null
        },
        _id: { $ne: personaIdentifier._id },
        organisation: personaIdentifier.organisation
      };

      // find all personaIdentifiers that have a person and match one of our scoring scheme keys
      PersonaIdentifier.find(query, next);
    });
  };
  /**
   * @callback PersonaFinder~scoreFoundPersonaIdentifiersCallback
   * @param {Error} An error if available
   * @param {Object}  {personaIdentifier, matchedPersona, suggestedPersonas}
   */

  /**
    * Reducing each idents into a single score
    * @param  {[type]} scoringScheme     [description]
    * @param  {[type]} personaIdentifier The personaIdentifier we are currently scoring
    * @param  {Object} {score, matches}  The reduced object (containing all matches and the total score for this PI)
    * @param  {[type]} otherIdent        The ident we are comparing to (usually from the source, e.g. statment)
    * @return {Object}                   Object with score and matches
    */
  reduceOtherScore = (scoringScheme, personaIdentifier, { score, matches }, otherIdent) => {
    const scorableIdentKeys = this.getScorableIdentKeys(scoringScheme);
    let thisScore = 0;
    if (otherIdent) {
      // loop through all the personaIdentifiers idents and see if it matches this ident
      const otherIdentVal = this.getIdentValueForScoring(otherIdent);
      for (const ident of personaIdentifier.toJSON().identifiers) {
        if (ident.key === otherIdent.key) {
          const keySetting = SCORABLE_KEY_SETTINGS[ident.key] || {};
          const matchType = keySetting.matchType || 'fuzzy';
          let strScore;
          const identVal = this.getIdentValueForScoring(ident);
          if (
            typeof identVal === 'string' &&
            typeof otherIdentVal === 'string' &&
            matchType === 'fuzzy'
          ) {
            logger.debug(`scoring ${identVal} vs ${otherIdentVal}`, otherIdent);
            strScore = parseFloat(stringScore(identVal, otherIdentVal, 0.5)).toFixed(2);
          } else {
            strScore = identVal === otherIdentVal ? 1 : 0;
          }
          logger.silly(`Comparing ${identVal} to ${otherIdentVal} gave a score of ${strScore}`);
          if (strScore > 0) {
            const keyScore = _.get(scorableIdentKeys, otherIdent.key, 0);
            thisScore = strScore * keyScore;
            ident.score = thisScore;
            ident.comparedValue = otherIdent.value;
            matches.push(ident);
          }
        }
      }
    }
    return {
      score: score + thisScore,
      matches
    };
  };

  /**
    * Take found personaIdentifiers and return either the first persona with a score past the matching threshold or an array of suggestedPersonas
    * @param  [{PersonaIdentifier}]   foundPersonaIdentifiers Multiple personaIdentifiers
    * @param  {PersonaIdentifier}   personaIdentifier A personaIdentifier object
    * @param  {PersonaFinder~scoreFoundPersonaIdentifiersCallback} next
    */
  scoreFoundPersonaIdentifiers = (foundPersonaIdentifiers, personaIdentifier, next) => {
    this.getScoringScheme(personaIdentifier.organisation, (err, scoringScheme) => {
      if (err) return next(err);
      const suggestedPersonasObj = {};

      // foreach of these personaIdentifiers, go see if any of the idents match scoring keys
      logger.silly(`Scoring against ${foundPersonaIdentifiers.length} personaIdentifiers`);
      let matchedPersona = null;
      async.someSeries(
        foundPersonaIdentifiers,
        (model, cb) => {
          const personPromise = Persona.findById(model.persona);
          //  personPromise.catch(cb);
          personPromise.then((modelPersona) => {
            // if the person does not exist, then move onto the next one in the loop
            if (!modelPersona) {
              model.persona = null;
              return model.save();
            }

            let identMatchingData = {
              score: 0,
              matches: []
            };

            const modelObj = model.toObject();

            if (_.has(modelObj, 'identifiers')) {
              identMatchingData = _.reduce(
                modelObj.identifiers,
                this.reduceOtherScore.bind(null, scoringScheme, personaIdentifier),
                identMatchingData,
                scoringScheme
              );
            }

            const totalScore = identMatchingData.score;
            const matches = identMatchingData.matches;
            logger.silly(
              `${personaIdentifier.uniqueIdentifier.key}/${personaIdentifier.uniqueIdentifier
                .value} scored at ${totalScore} on ${model.persona}`,
              matches
            );
            if (totalScore >= scoringScheme.targetScore) {
              matchedPersona = {
                persona: modelPersona,
                matches
              };
              return cb(true);
            } else if (totalScore >= scoringScheme.suggestionScore) {
              if (
                !_.has(suggestedPersonasObj, model.persona) ||
                totalScore > suggestedPersonasObj[model.persona]
              ) {
                suggestedPersonasObj[model.persona] = {
                  score: totalScore,
                  matches
                };
              }
            }
            return cb(false);
          });
        },
        () => {
          const suggestedPersonas = _.map(suggestedPersonasObj, (value, key) => ({
            persona: key,
            score: value.score,
            matches: value.matches
          }));

          if (suggestedPersonas.length > 0) {
            logger.silly('suggestedPersonas:', suggestedPersonas);
          } else {
            logger.silly('No suggestedPersonas found');
          }

          // if we have a matchedPersonaId, check it exists and return the model
          if (matchedPersona) {
            logger.debug('Matched a persona!', matchedPersona);
            return next(null, {
              personaIdentifier,
              matchedPersona,
              suggestedPersonas
            });
          }

          next(null, {
            personaIdentifier,
            matchedPersona: null,
            suggestedPersonas
          });
        }
      );
    });
  };

  /**
   * Saves the suggested personas to the personaIdentifier
   * @param  {PersonaIdentifier}   personaIdentifier A personaIdentifier object
   * @param  {PersonaFinder~assignSuggestedPersonasToPersonaIdentifierCallback} next
   */
  assignSuggestedPersonasToPersonaIdentifier = ({ personaIdentifier, suggestedPersonas }, next) => {
    // add suggested personas to personaScores in the personaIdentifier
    const mappedSuggestions = _.map(suggestedPersonas, persona =>
      _.pick(persona, ['persona', 'score', 'matches'])
    );

    // loop through each suggestion and update the scoredPersonas for this suggested persona
    async.each(
      mappedSuggestions,
      (suggestedPersona, cb) => {
        // Search for this personaIdentifier and see if a scoredPersona exists for this person
        PersonaIdentifier.findOne(
          {
            _id: personaIdentifier._id,
            'personaScores.persona': suggestedPersona.persona
          },
          (err, doc) => {
            if (err) return cb(err);
            if (doc) {
              // if we have found a document, update it
              PersonaIdentifier.findOneAndUpdate(
                {
                  _id: personaIdentifier._id,
                  'personaScores.persona': suggestedPersona.persona
                },
                {
                  $set: {
                    'personaScores.$.matches': suggestedPersona.matches,
                    'personaScores.$.score': suggestedPersona.score
                  }
                },
                { upsert: false },
                (err) => {
                  cb(err);
                }
              );
            } else {
              // otherwise push in the new doc
              personaIdentifier.personaScores.push(suggestedPersona);
              personaIdentifier.save((err) => {
                cb(err);
              });
            }
          }
        );
      },
      (err) => {
        if (err) return next(err);
        personaIdentifier.save((err, updatedPersonaIdentifier) => {
          if (err) return next(err);
          next(null, updatedPersonaIdentifier);
        });
      }
    );
  };
  /**
   * @callback PersonaFinder~assignSuggestedPersonasToPersonaIdentifierCallback
   * @param {Error} An error if available
   * @param {PersonaIdentifier}  updatedPersonaIdentifier
   */

  /**
   * Makes a new persona from the given personaIdentifier
   * @param  {PersonaIdentifier}   personaIdentifier A personaIdentifier object
   * @param  {PersonaFinder~createPersonaFromPersonaIdentifierCallback} next
   */
  createPersonaFromPersonaIdentifier = (personaIdentifier, next) => {
    if (!personaIdentifier || !personaIdentifier.identifiers) {
      return next(new Error('Expected personaIdentifier with identifiers'));
    }
    const personaName = personaIdentifier.getDisplayName();

    // create person
    const newPersona = new Persona({
      organisation: personaIdentifier.organisation,
      name: personaName
    });
    logger.silly(`Starting persona create for ${personaIdentifier._id.toString()}`);
    newPersona.save((err, persona) => {
      if (err) return next(err);
      logger.silly(`Persona created for ${personaIdentifier._id.toString()}`, err);
      this.assignPersonaToPersonaIdentifier({ persona, personaIdentifier }, next);
      // assign the new persona to the personaIdentifier
    });
  };
  /**
   * @callback PersonaFinder~createPersonaFromPersonaIdentifierCallback
   * @param {Error} An error if available
   * @param {Object}  {persona, personaIdentifier}
   */

  /**
   * Attempts to match personaIdentifiers to other identifiers in increasingly loose ways
   * @param  {PersonaIdentifier}   personaIdentifier A personaIdentifier object
   * @param  {PersonaFinder~checkForSimilarFromAttachedPersonaIdentifierCallback} next
   */
  checkForSimilarFromAttachedPersonaIdentifier = (personaIdentifier, next) => {
    if (!personaIdentifier || !personaIdentifier.identifiers) {
      return next(new Error('No identifiers on personaIdentifier'));
    }

    this.lookForMatchesOnAllTypes(personaIdentifier, (err, updatedPersonaIdentifier) => {
      if (err) return next(err);
      this.lookForLooseMatchesOnAllTypes(
        updatedPersonaIdentifier,
        (err, looseUpdatedPersonaIdentifier) => {
          if (err) return next(err);
          next(null, { personaIdentifier: looseUpdatedPersonaIdentifier });
        }
      );
    });
  };
  /**
   * @callback PersonaFinder~checkForSimilarFromAttachedPersonaIdentifierCallback
   * @param {Error} An error if available
   * @param {Object}  {statement, personaIdentifier}
   */

  // /**
  //  * Update personaIdentifiers that have a uniquely matching ident similar to that of one on the passed in personaIdentifier
  //  * @param  {PersonaIdentifier}   personaIdentifier
  //  * @param  {PersonaFinder~updatePersonasWhereMatchesUniqueIdentCallback} next
  //  */
  // updatePersonasWhereMatchesUniqueIdent = (personaIdentifier, next) => {
  //   if (!personaIdentifier.persona) {
  //     return next(new Error('No persona on personaIdentifier'));
  //   }
  //
  //   // go find other matching persona identifiers that HAVE a persona attached
  //   const identQueries = this.matchingPersonaIdentifiersQuery(personaIdentifier);
  //   if (!identQueries) { // no valid idents found
  //     return next(new Error('No uniquely identifiable identifiers found'));
  //   }
  //
  //   const query = {
  //     '$or': identQueries,
  //     persona: null
  //   };
  //   // if the statement has a unique ident  (e.g. statement.actor.mbox)
  //   // look for all identifiers where person IS null and matches one the "unique" idents by value AND type
  //   //   update person on found identifier to the one on personaIdentifier
  //
  //   PersonaIdentifier.update(query, {persona: personaIdentifier.persona}, {multi: true}, next);
  // };
  // /**
  //  * @callback PersonaFinder~updatePersonasWhereMatchesUniqueIdentCallback
  //  * @param {Error} An error if available
  //  * @param {Object}  Raw database response after update
  //  */

  lookForMatchesOnAllTypes = (personaIdentifier, next) => {
    // look for all identifiers where person IS null and matches any of the idents by value only (any type acceptable)
    // foreach of these idents
    //   insert respective person into personaScore array with associated score
    next(null, personaIdentifier);
  };

  lookForLooseMatchesOnAllTypes = (personaIdentifier, next) => {
    // look for all identifiers where person IS null and there is a loose matches on any of the idents by value only (any type acceptable)
    // foreach of these idents
    //     insert respective person into personaScore array with associated score
    next(null, personaIdentifier);
  };
}
