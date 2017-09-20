import _ from 'lodash';
import async from 'async';
import logger from 'lib/logger';
import {
  getScorableIdentifiers,
  getUniqueIdentifiersFromDoc,
  assignOrCreatePersona,
  mergePersonas
} from 'lib/services/persona';
import { STATEMENT_ACTOR_NAME } from 'lib/constants/statements';
import Persona from 'lib/models/persona';
import PersonaFinder from 'lib/classes/PersonaFinder';

const personaFinder = new PersonaFinder();

export default (dataModel, importModel, next) => {
  const data = dataModel.data;
  const organisation = importModel.organisation;
  const matchedIndexes = importModel.matchedIndexes;
  const customIndexes = importModel.customIndexes || [];
  if (!organisation) {
    return next(new Error('No organisation set'));
  }
  // first get the unique identifier
  getUniqueIdentifiersFromDoc(data, matchedIndexes, (err, uniqueIdents) => {
    try {
      if (err) return next(err);
      if (_.isEmpty(uniqueIdents)) {
        return next(
          new Error(
            'Expected at least one uniqueIdentifier to be found in the upload'
          )
        );
      }

      const firstUnique = uniqueIdents[0];
      const remainingUniques = _.slice(uniqueIdents, 1, uniqueIdents.length);
      const jsonIdents = getScorableIdentifiers(
        uniqueIdents,
        data,
        organisation,
        matchedIndexes,
        customIndexes
      );

      // fetch a name that we can use if we end up making a user
      const newPersonaName = jsonIdents[STATEMENT_ACTOR_NAME] || null;

      const otherIdentifiers = [];
      _.forEach(jsonIdents, (value, key) => {
        // only allow string values into other idents
        if (typeof value === 'string') {
          let splitValue = value.split(',');
          if (splitValue.length === 0) {
            splitValue = null;
          } else if (splitValue.length === 1) {
            splitValue = splitValue[0];
          }
          if (splitValue) {
            const newIdent = personaFinder.makeIdent(key, splitValue);
            otherIdentifiers.push(newIdent);
          }
        }
      });

      // add the otherIdentifiers to the first unique we found
      logger.debug(
        `LOOKING FOR unique ${JSON.stringify(firstUnique)} with idents of ${JSON.stringify(otherIdentifiers)}`
      );
      logger.debug(
        `REMAINING UNIQUES FOR THIS ROW: ${JSON.stringify(remainingUniques)}`
      );

      personaFinder.findOrCreatePersonaIdentifier(
        organisation,
        firstUnique,
        otherIdentifiers,
        (err, firstPersonaIdentifier) => {
          // update the query builder cache for the newFirstPersonIdentifier
          if (err) {
            logger.error('ERROR FINDING OR CREATING PI', err);
            return next(err);
          }
          if (!firstPersonaIdentifier) {
            return next(
              new Error(
                'Expected a firstPersonaIdentifier to be found or created'
              )
            );
          }
          logger.debug(
            'FOUND UNIQUE',
            JSON.stringify(firstPersonaIdentifier.toJSON())
          );
          const allowPersonaCreation =
            firstPersonaIdentifier.isExisting === false;

          let personas = [];
          if (firstPersonaIdentifier.persona) {
            personas.push(firstPersonaIdentifier.persona.toString());
          }

          // loop through ALL uniques and look for a person on each

          async.mapSeries(
            remainingUniques,
            (uiData, cb) => {
              personaFinder.findOrCreatePersonaIdentifier(
                organisation,
                uiData,
                null,
                (err, pi) => {
                  if (err) return cb(err);
                  if (pi.persona) personas.push(pi.persona.toString());
                  cb(null, pi);
                }
              );
            },
            (err, remainingPersonaIdentifiers) => {
              if (err) return next(err);
              let personaID;

              // make unique array of personas
              personas = _.uniq(personas);

              const allPersonaIdentifiers = [firstPersonaIdentifier].concat(
                remainingPersonaIdentifiers
              );
              logger.debug(
                `WE MUST DEEEEAL WITH IT: ${JSON.stringify(allPersonaIdentifiers)}`
              );

              if (personas.length === 1) {
                // we have only 1 person - nice and simple; lets assign all the personaIdentifiers to them
                personaID = personas[0];
                logger.verbose('HAVE PERSONA', personaID);
                // first though, check they actually exist!
                Persona.findById(personaID, (err, persona) => {
                  if (err) return next(err);
                  assignOrCreatePersona(
                    {
                      persona,
                      newPersonaName,
                      personaIdentifiers: allPersonaIdentifiers
                    },
                    next
                  );
                });
              } else if (personas.length > 1) {
                // if we find more than 1 person, merge them!
                logger.verbose('MERGE PERSONAS', personas);
                // lets merge everyone into the first persona we found
                const mainPersonaId = _.head(personas);
                const allOtherPersonaIds = _.tail(personas);

                // loop through all other people and merge them into the main one
                async.mapSeries(
                  allOtherPersonaIds,
                  (personaId, cb) => {
                    mergePersonas(organisation, personaId, mainPersonaId)
                      .then((updatedIdents) => {
                        cb(null, updatedIdents);
                      })
                      .catch(cb);
                  },
                  (err, updatedIdents) => {
                    if (err) return next(err);
                    const updatedPersonaIdentifiers = _.union(updatedIdents);
                    Persona.findById(mainPersonaId, (err, persona) => {
                      if (err) return next(err);
                      next(null, {
                        persona,
                        personaIdentifiers: updatedPersonaIdentifiers
                      });
                    });
                  }
                );
              } else if (personas.length === 0) {
                logger.verbose('NO PERSONAS DIRECTLY FOUND FROM ROWS DATA');
                logger.verbose('Looping though all personaIdents for matches');
                let foundPersona = null;
                // if we find no person, go score for each ident until we find one
                async.mapSeries(
                  remainingPersonaIdentifiers,
                  // map through each remaining UI
                  (ui, cb) => {
                    // if we've already found a persona, then skip this step for further idents
                    if (!foundPersona) {
                      personaFinder.getPersonaFromPersonaIdentifier(
                        ui,
                        (err, handleData) => {
                          if (err) return cb(err);
                          if (
                            handleData.matchedPersona &&
                            handleData.matchedPersona.persona
                          ) {
                            foundPersona = handleData.matchedPersona.persona;
                          }
                          cb(null);
                        }
                      );
                    } else {
                      cb(null);
                    }
                  },
                  // handle mapSeries callback
                  (err) => {
                    if (err) return next(err);
                    if (allowPersonaCreation) {
                      assignOrCreatePersona(
                        {
                          persona: foundPersona,
                          newPersonaName,
                          personaIdentifiers: allPersonaIdentifiers
                        },
                        next
                      );
                    } else {
                      logger.verbose(
                        'THIS UI WAS NOT ACTUALLY CREATED BY US, SOMETHING ELSE IS PROBABLY HANDLING PERSONA CREATION'
                      );
                      next(null, {
                        persona: null,
                        personaIdentifiers: allPersonaIdentifiers
                      });
                    }
                  }
                );
              } else {
                // not entirely sure how you got here...
                next(new Error('Less than no personas found?? How.'));
              }
            }
          );
        }
      );
    } catch (err) {
      next(err);
    }
  });
};
