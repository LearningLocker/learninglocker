import { publish } from 'lib/services/queue';
import { promisify } from 'bluebird';
import { PERSONA_IMPORT_QUEUE, STAGE_IMPORTED } from 'lib/constants/personasImport';
import importPersona from 'lib/services/importPersonas/importPersona';
import moment from 'moment';
import PersonasImport from 'lib/models/personasImport';
import { addErrorsToCsv } from 'lib/services/importPersonas/importPersonas';

export const finishedProcessing = async ({
  personaImportId
}) => {
  await PersonasImport.updateOne({
    _id: personaImportId
  }, {
    importStage: STAGE_IMPORTED,
    importedAt: moment().toDate()
  });

  const personasImport = await PersonasImport.findOne({
    _id: personaImportId
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
  try {
    const { processedCount, totalCount } = await importPersona({
      personaImportId,
      structure,
      organisation,
      personaService
    })(data, index);
    if (totalCount && processedCount >= totalCount) {
      await finishedProcessing({ personaImportId });
    }
  } catch (err) {
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
  }

  done();
};
