import { publish } from 'lib/services/queue';
import { promisify } from 'bluebird';
import ImportPersonasLock from 'lib/models/importPersonasLock';
import { getIfis } from 'lib/services/importPersonas/personasImportHelpers';
import { PERSONA_IMPORT_QUEUE, STAGE_IMPORTED } from 'lib/constants/personasImport';
import importPersona from 'lib/services/importPersonas/importPersona';
import moment from 'moment';
import PersonasImport from 'lib/models/personasImport';
import { addErrorsToCsv } from 'lib/services/importPersonas/importPersonas';

// exported for testing
export const establishLock = async ({
  structure,
  data,
  organisation,
  ifis = getIfis({
    structure,
    row: data
  }), // argument for testing only
}) => {
  try {
    const result = await ImportPersonasLock.findOneAndUpdate({
      organisation,
      ifis
    }, {
      organisation,
      ifis
    }, {
      upsert: true,
      new: true
    });
    return result;
  } catch (err) {
    console.log('001', err.codeName, err.code);
    if (err.code && err.code === 11000) { // DuplicateKey
      return false;
    }
    throw err;
  }
};

const releaseLock = async ({
  lock
}) => {
  await lock.remove();
};

export const finishedProcessing = async ({
  personaImportId
}) => {
  const personasImport = await PersonasImport.findOneAndUpdate({
    _id: personaImportId
  }, {
    importStage: STAGE_IMPORTED,
    importedAt: moment().toDate()
  }, {
    new: true
  });

  await addErrorsToCsv({
    personasImport,
    csvHandle: personasImport.csvHandle
  });
};

export default personaService => async ({
  index,
  data,
  personaImportId,
  structure,
  organisation
}, done) => {
  // establish lock

  const lock = await establishLock({ structure, data, organisation });
  if (!lock) {
    await promisify(publish)({
      queueName: PERSONA_IMPORT_QUEUE,
      payload: {
        index,
        data,
        personaImportId,
        structure,
        organisation
      }
    });
    done();
    return;
  }

  // Do the magic
  const { processedCount, totalCount } = await importPersona({
    personaImportId,
    structure,
    organisation,
    personaService
  })(data, index);

  // have we finished processing ???

  if (totalCount && processedCount >= totalCount) {
    await finishedProcessing({ personaImportId });
  }

  // release lock
  await releaseLock({ lock });

  done();
};
