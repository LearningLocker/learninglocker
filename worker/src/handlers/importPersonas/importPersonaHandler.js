import { publish } from 'lib/services/queue';
import { promisify } from 'bluebird';
import ImportPersonasLock from 'lib/models/importPersonasLock';
import { getIfis } from 'lib/services/importPersonas/personasImportHelpers';
import { PERSONA_IMPORT_QUEUE } from 'lib/constants/personasImport';
import importPersona from 'lib/services/importPersonas/importPersona';

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
  console.log('003');


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
    if (err.code && err.codeName === 'DuplicateKey') {
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

export default personaService => async ({
  index,
  data,
  personaImportId,
  structure,
  organisation
}, done) => {
  console.log('001 WORKER importPersonaHandler');
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
  await importPersona({
    personaImportId,
    structure,
    organisation,
    personaService
  })(data, index);

  // release lock
  await releaseLock({ lock });

  // have we finished processing ???



  done();
};
