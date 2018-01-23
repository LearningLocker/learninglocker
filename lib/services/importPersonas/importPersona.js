import { map } from 'bluebird';
import { head, tail, find, flatten } from 'lodash';
import {
  getPersonaName,
  getIfis,
  getAttributes
} from 'lib/services/importPersonas/personasImportHelpers';
import reasignPersonaStatements from 'lib/services/persona/reasignPersonaStatements';
import PersonasImport from 'lib/models/personasImport';
import { validateIfi } from 'lib/services/persona/validateIfi';
import updateQueryBuilderCache from './updateQueryBuilderCache';

export default ({
  personaImportId,
  structure,
  organisation,
  personaService,
}) => async (row, rowIndex) => {
  const personaName = getPersonaName({
    structure,
    row
  });

  let ifis;
  ifis = getIfis({
    structure,
    row
  });

  const erroringIfis = ifis
    .filter((ifi) => {
      return validateIfi(ifi, ['ifi']).length > 0;
    })

  console.log('length', erroringIfis.length)
  if(erroringIfis.length > 0) {

    const errors = erroringIfis.map((ifi) => {
      return validateIfi(ifi, ['ifi']);
    });
    const flattenedErrors = flatten(errors);

    await PersonasImport.findOneAndUpdate({
      _id: personaImportId
    }, {
      $push: {
        importErrors: {
          row: rowIndex,
          rowErrors: flattenedErrors.map(err => `${err.path.join('.')}: ${err.data}`)
        }
      }
    });

    return;
  }

  // Create or update persona identifier
  const personaIdentifiers = await map(
    ifis,
    ifi => personaService.createUpdateIdentifierPersona({
      organisation,
      personaName,
      ifi
    })
  );

  // if created identifier exists, then it is merged.
  const merged = !find(personaIdentifiers, ({ wasCreated }) => wasCreated);

  const personaIds = await map(personaIdentifiers, ({ personaId }) => personaId);
  const toPersonaId = head(personaIds);
  const fromPersonaIds = tail(personaIds);

  // Merge personas
  await map(fromPersonaIds, (fromPersonaId) => {
    if (toPersonaId === fromPersonaId) {
      // Do nothing, as the ifi already points to this persona.
      return;
    }

    return Promise.all([
      personaService.mergePersona({
        organisation,
        toPersonaId,
        fromPersonaId
      }),
      reasignPersonaStatements({
        organisation,
        fromId: fromPersonaId,
        toId: toPersonaId
      })
    ]);
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
