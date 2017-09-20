import async from 'async';
import PersonaFinder from 'lib/classes/PersonaFinder';


const setPersonaName = (persona, newName, next) => {
  if (newName && newName.length > 0) {
    persona.name = newName;
    persona.save(next);
  } else {
    next(null, persona);
  }
};

/**
 * assign all personaIdentifiers to use a persona
 * @param  {string}   newPersonaName
 * @param  {Persona}   persona
 * @param  {array}   personaIdentifiers
 * @param  {Function} next(err, updatedPersonaIdentifiers)   Callback with error, and array of all updatedPersonaIdentifiers
 */
export default ({ newPersonaName, persona, personaIdentifiers }, next) => {
  const personaFinder = new PersonaFinder();
  setPersonaName(persona, newPersonaName, (err, updatedPersona) => {
    if (err) return next(err);
    async.map(
      personaIdentifiers,
      (personaIdentifier, cb) => {
        personaFinder.assignPersonaToPersonaIdentifier({ persona: updatedPersona, personaIdentifier }, (err, data) => {
          if (err) return cb(err);
          // return the updated personaIdentifier back out into the callback
          cb(null, data.personaIdentifier);
        });
      },
      (err, updatedPersonaIdentifiers) => {
        if (err) return next(err);
        next(null, updatedPersonaIdentifiers);
      }
    );
  });
};
