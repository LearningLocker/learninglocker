import PersonasImport from 'lib/models/personasImport';
import * as filesService from 'lib/services/files';
import csv from 'fast-csv';
import highland from 'highland';
import { promisify } from 'bluebird';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import {
  STAGE_PROCESSING,
  PERSONA_IMPORT_QUEUE
} from 'lib/constants/personasImport';
import NotFoundError from 'lib/errors/NotFoundError';
import AllreadyProcessingError from 'lib/errors/AllreadyProcessingError';
import { sortBy, drop, head } from 'lodash';
import { publish } from 'lib/services/queue';
// import proccessData from './importPersona';
import { finishedProcessing } from 'worker/handlers/importPersonas/importPersonaHandler';

// exported for testing
export const addErrorsToCsv = async ({
  csvHandle,
  personasImport
}) => {
  const csvStream = csv.parse({
    headers: true,
    quoteHeaders: true
  });

  const csvWriteStream = csv.createWriteStream({
    headers: true
  });

  let sortedImportErrors = sortBy(personasImport.importErrors, 'row');

  let i = 1;
  const highlandStream = highland(csvStream)
    .flatMap((data) => {
      const out = highland((async (dat) => {
        let ou;

        if (head(sortedImportErrors) && head(sortedImportErrors).row === i) {
          ou = {
            ...dat,
            errors: head(sortedImportErrors).rowErrors.join(', ')
          };
          sortedImportErrors = drop(sortedImportErrors);
        } else {
          ou = {
            ...dat,
            errors: null
          };
        }

        i += 1;
        return ou;
      })(data, i));

      return out;
    });

  highlandStream.pipe(csvWriteStream);

  filesService.downloadToStream(csvHandle)(csvStream);

  await filesService.uploadFromStream(csvHandle)(csvWriteStream);
};

const processDataThroughWorker = ({
  personaImportId,
  structure,
  organisation
}) => (data, i) => {
  const out = promisify(publish)({
    queueName: PERSONA_IMPORT_QUEUE,
    payload: {
      index: i,
      data,
      personaImportId,
      structure,
      organisation
    }
  });

  return out;
};

const importPersonasLong = async ({
  id,
  personaImport,
  personaService
}) => {
  const {
    structure,
    csvHandle,
    organisation
  } = personaImport;

  // Fast csv
  const csvStream = csv.parse({
    headers: true,
    quoteHeaders: true
  });

  const proccessDataFn = processDataThroughWorker({
    personaImportId: id,
    structure,
    personaService,
    organisation
  });

  let rowIndex = 0;
  const proccessPromise = highland(csvStream)
    .each((data) => {
      rowIndex += 1;
      proccessDataFn(data, rowIndex);
    })
    .collect()
    .toPromise(Promise);

  filesService.downloadToStream(csvHandle)(csvStream);

  await proccessPromise;

  const personaImportWithTotalCount = await PersonasImport.findOneAndUpdate({
    _id: id
  }, {
    totalCount: rowIndex
  }, {
    new: true
  });

  if (
    personaImportWithTotalCount.processedCount >= personaImportWithTotalCount.totalCount &&
    personaImportWithTotalCount.importStage === STAGE_PROCESSING
  ) {
    // fix the stuff
    await finishedProcessing({
      personaImportId: id
    });
  }

  return;
};

const importPersonasShort = async ({
  id,
  authInfo
}) => {
  const filter = await getScopeFilter({
    modelName: 'personasImport',
    actionName: 'edit',
    authInfo
  });

  const personaImport = await PersonasImport.findOne({
    _id: id,
    ...filter
  });
  if (!personaImport) throw new NotFoundError();
  if (personaImport.importStage === STAGE_PROCESSING) throw new AllreadyProcessingError('personasImport', id);

  personaImport.importStage = STAGE_PROCESSING;

  await personaImport.save();

  return personaImport;
};

const importPersonas = async ({
  id,
  personaService,
  authInfo
}) => {
  const personaImport = await importPersonasShort({
    id,
    personaService,
    authInfo
  });

  const importPersonasPromise = importPersonasLong({
    id,
    personaImport,
    personaService
  });

  return {
    personaImport,
    importPersonasPromise
  };
};

export default importPersonas;
