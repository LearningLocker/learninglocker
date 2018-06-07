import { publish } from 'lib/services/queue';
import { promisify, map } from 'bluebird';
import ImportPersonasLock from 'lib/models/importPersonasLock';
import { getIfis } from 'lib/services/importPersonas/personasImportHelpers';
import { PERSONA_IMPORT_QUEUE, STAGE_IMPORTED } from 'lib/constants/personasImport';
import importPersona from 'lib/services/importPersonas/importPersona';
import moment from 'moment';
import PersonasImport from 'lib/models/personasImport';
import { addErrorsToCsv } from 'lib/services/importPersonas/importPersonas';

const LOCK_TIMEOUT = 120; // seconds

// exported for testing
export const establishLock = async ({
  structure,
  data,
  organisation,
  ifis = getIfis({
    structure,
    row: data
  }), // private
  lockTimeout = LOCK_TIMEOUT * 1000 // testing
}) => {
  try {
    const result = await ImportPersonasLock.create({
      organisation,
      ifis
    });

    return result;
  } catch (err) {
    // DuplicateKey
    if (err.code && err.code === 11000) {
      const op = err.getOperation();

      const models = ImportPersonasLock.find({
        organisation: op.organisation,
        ifis: {
          $in: op.ifis
        }
      });

      let remainingLocks = false;
      const deletePromises = map(models, (model) => {
        if (moment(model.createdAt).add(lockTimeout, 'milliseconds').isBefore(moment())) {
          return model.remove();
        }
        remainingLocks = true;
      });

      await deletePromises;
      if (remainingLocks === false) {
        return await establishLock({
          structure,
          data,
          organisation,
          ifis,
          lockTimeout
        });
      }

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
    csvHandle: personasImport.csvHandle,
    csvOutHandle: personasImport.csvErrorHandle
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
