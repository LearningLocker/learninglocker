import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import PersonaFinder from 'lib/classes/PersonaFinder';

export default async (organisation, mergePersonaFromId, mergePersonaToId) => {
  const PersonaIdentifier = getConnection().model('PersonaIdentifier');
  const Persona = getConnection().model('Persona');
  const objectId = mongoose.Types.ObjectId;
  const personaFinder = new PersonaFinder();

  // check the personas are not the same
  if (mergePersonaFromId === mergePersonaToId) {
    throw new Error('Cannot merge a persona into itself.');
  }
  // go fetch both the personas
  const personas = await Promise.all([
    Persona.findOne({
      _id: objectId(mergePersonaFromId),
      organisation
    }).exec(),
    Persona.findOne({
      _id: objectId(mergePersonaToId),
      organisation
    }).exec()
  ]);

  if (personas.includes(null)) {
    throw new Error('One of the given personas is not available');
  }
  const mergeFromPersona = personas[0];
  const mergeToPersona = personas[1];
  // find any PersonaIdentifiers suggesting the old persona
  const personaIdentifiersForRescoring = await PersonaIdentifier.find({
    'personaScores.persona': mergeFromPersona._id
  }).exec();

  // get all personaIdentifiers that will need updating (their persona will change)
  const personaIdentifiers = await PersonaIdentifier.find({
    persona: objectId(mergePersonaFromId)
  }).exec();

  // update all personas on personaIdentifiers pointing at mergeFrom
  const newPersonaId = objectId(mergePersonaToId);
  const updatedPersonaIdentifiers = await Promise.all(
    personaIdentifiers.map((personaIdentifier) => {
      personaIdentifier.persona = newPersonaId;
      return personaIdentifier.save();
    })
  );

  await mergeFromPersona.remove();

  // pass the personaIdentifiersForRescoring to the PersonaFinder for rescoring against the mergeToPersona
  await Promise.all(
    personaIdentifiersForRescoring.map(
      pi =>
        new Promise((resolve, reject) =>
          personaFinder.handlePersonaIdentifierForPersona(
            { personaIdentifier: pi, persona: mergeToPersona },
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          )
        )
    )
  );
  return updatedPersonaIdentifiers;
};
