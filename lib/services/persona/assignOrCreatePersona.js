import logger from 'lib/logger';
import PersonaFinder from 'lib/classes/PersonaFinder';
import { mapPersonaToIdentifiers } from 'lib/services/persona';


/**
 * Either creates a persona, or assigns a persona to multiple idents
 * @param  {Persona}   persona
 * @param  {string}   newPersonaName
 * @param  {array}   personaIdentifiers
 * @param  {Function} next                  [description]
 * @return {[type]}                         [description]
 */
export default ({ persona, newPersonaName, personaIdentifiers }, next) => {
  const personaFinder = new PersonaFinder();

  if (persona) {
    mapPersonaToIdentifiers({ newPersonaName, persona, personaIdentifiers }, (err, updatedPersonaIdentifiers) => {
      if (err) return next(err);
      next(null, { persona, personaIdentifiers: updatedPersonaIdentifiers });
    });
  } else {
    logger.verbose('CREATE NEW PERSONA');
    if (personaIdentifiers.length === 0) return next(new Error('Expected personaIdentifiers array to have at least 1 entry'));
    // use the first personaIdentifier as our base (we assume this has any additional ident details such as name on it)
    personaFinder.createPersonaFromPersonaIdentifier(personaIdentifiers[0], (err, data) => {
      if (err) return next(err);
      const foundPersona = data.persona;
      mapPersonaToIdentifiers({ newPersonaName, persona: foundPersona, personaIdentifiers }, (err, updatedPersonaIdentifiers) => {
        if (err) return next(err);
        next(null, { persona: foundPersona, personaIdentifiers: updatedPersonaIdentifiers });
      });
    });
  }
};
