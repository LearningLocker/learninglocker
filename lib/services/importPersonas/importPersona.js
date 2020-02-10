import { map } from 'bluebird';
import { head, tail, find, flatten, isString } from 'lodash';
import {
  getPersonaName,
  getIfis,
  getAttributes
} from 'lib/services/importPersonas/personasImportHelpers';
import logger from 'lib/logger';
import reasignPersonaStatements from 'lib/services/persona/reasignPersonaStatements';
import PersonasImport from 'lib/models/personasImport';
import { validateIfi } from 'lib/services/persona/validateIfi';
import establishLock from 'lib/services/importPersonas/establishLock';
import updateQueryBuilderCache from './updateQueryBuilderCache';

export default ({
  personaImportId,
  structure,
  organisation,
  personaService
}) => async (row, rowIndex) => {
  const personaName = getPersonaName({ structure, row });
  const ifis = getIfis({ structure, row });
  const erroringIfis = ifis.filter(ifi => validateIfi(ifi, ['ifi']).length > 0);

  if (erroringIfis.length > 0 || ifis.length === 0) {
    const errors = erroringIfis.map(ifi =>
      validateIfi(ifi, ['ifi'])
    );
    const flattenedErrors = flatten(errors);

    await PersonasImport.updateOne({ _id: personaImportId }, {
      $inc: {
        processedCount: 1,
      },
      $push: {
        importErrors: {
          row: rowIndex,
          rowErrors: (ifis.length === 0) ?
            'No ifis' :
            flattenedErrors.map(err => `${err.path.join('.')}: ${err.data}`)
        }
      }
    });

    const result = await PersonasImport.findOne({
      _id: personaImportId
    });

    if (!result) {
      return {
        processedCount: 0,
        totalCount: 0
      };
    }

    return {
      processedCount: result.processedCount,
      totalCount: result.totalCount
    };
  }

  const lock = await establishLock({ structure, data: row, organisation });

  try {
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
    if (personaName && isString(personaName) && personaName.length > 0) {
      // update the persona to have the new name
      // upsert to ensure that the persona is made if has been removed since
      logger.silly(`updating ${toPersonaId} to have name ${personaName}`);
      await personaService.updatePersona({
        organisation,
        personaId: toPersonaId,
        name: personaName,
        upsert: true
      });
    }

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

    // Additional information
    const attributes = getAttributes({
      structure,
      row
    });

    await map(attributes, attribute => personaService.overwritePersonaAttribute({
      organisation,
      personaId: toPersonaId,
      ...attribute
    }));

    await updateQueryBuilderCache({
      attributes,
      organisation
    });

    await PersonasImport.updateOne({
      _id: personaImportId
    }, {
      $inc: {
        processedCount: 1,
        'result.merged': merged ? 1 : 0,
        'result.created': !merged ? 1 : 0
      },
    });

    const result = await PersonasImport.findOne({
      _id: personaImportId
    });

    await lock.remove();

    if (!result) {
      return {
        processedCount: 0,
        totalCount: 0
      };
    }
    return {
      merged,
      processedCount: result.processedCount,
      totalCount: result.totalCount
    };
  } catch (err) {
    await lock.remove();
    throw err;
  }
};
