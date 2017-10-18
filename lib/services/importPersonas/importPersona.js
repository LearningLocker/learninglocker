import { map } from 'bluebird';
import { head, tail } from 'lodash';
import {
  getPersonaName,
  getIfis,
  getAttributes
} from 'lib/services/importPersonas/personasImportHelpers';

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

  const personaIds = await map(personaIdentifers, ({ personaId }) => personaId);
  const toPersonaId = head(personaIds);
  const fromPersonaIds = tail(personaIds);

  // Merge personas
  await map(fromPersonaIds, (fromPersonaId) => {
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

  console.log('personaService', personaService);

  await map(attributes, (attribute) => {
    personaService.overwritePersonaAttribute({
      organisation,
      personaId: toPersonaId,
      ...attribute
    });
  });
};
