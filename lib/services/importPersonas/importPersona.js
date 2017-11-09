import { map } from 'bluebird';
import { head, tail, find } from 'lodash';
import {
  getPersonaName,
  getIfis,
  getAttributes
} from 'lib/services/importPersonas/personasImportHelpers';
import updateQueryBuilderCache from './updateQueryBuilderCache';

export default ({
  structure,
  organisation,
  personaService,
}) => async (row) => {
  const personaName = getPersonaName({
    structure,
    row
  });

  const ifis = getIfis({
    structure,
    row
  });

  if (ifis.length === 0) {
    // Do nothing, no ifi's to match.
  }

  // Create or update persona identifier
  const personaIdentifers = await map(
    ifis,
    ifi => personaService.createUpdateIdentifierPersona({
      organisation,
      personaName,
      ifi
    })
  );

  // if created identifier exists, then it is merged.
  const merged = !find(personaIdentifers, ({ wasCreated }) => wasCreated);

  const personaIds = await map(personaIdentifers, ({ personaId }) => personaId);
  const toPersonaId = head(personaIds);
  const fromPersonaIds = tail(personaIds);

  // Merge personas
  await map(fromPersonaIds, (fromPersonaId) => {
    if (toPersonaId === fromPersonaId) {
      // Do nothing, as the ifi already points to this persona.
      return;
    }
    personaService.mergePersona({
      organisation,
      toPersonaId,
      fromPersonaId
    });
  });

  // Additional infomation
  const attributes = getAttributes({
    structure,
    row
  });

  await map(attributes, (attribute) => {
    personaService.overwritePersonaAttribute({
      organisation,
      personaId: toPersonaId,
      ...attribute
    });
  });

  await updateQueryBuilderCache({
    attributes,
    organisation
  });

  return merged;
};
