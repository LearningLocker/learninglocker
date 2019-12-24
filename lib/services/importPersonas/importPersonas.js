import PersonasImport from 'lib/models/personasImport';
import * as filesService from 'lib/services/files';
import * as csv from 'fast-csv';
import highland from 'highland';
import { promisify } from 'bluebird';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import {
  STAGE_PROCESSING,
  PERSONA_IMPORT_QUEUE
} from 'lib/constants/personasImport';
import NotFoundError from 'lib/errors/NotFoundError';
import AlreadyProcessingError from 'lib/errors/AlreadyProcessingError';
import { sortBy, drop, head } from 'lodash';
import { publish } from 'lib/services/queue';
import { finishedProcessing } from 'worker/handlers/importPersonas/importPersonaHandler';

export const addErrorsToCsv = async ({
  csvHandle,
  csvOutHandle,
  personasImport
}) => {
  const csvStream = csv.parse({
    headers: true,
    quoteHeaders: true
  });

  const csvWriteStream = csv.format({
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
      })(data));

      return out;
    });

  highlandStream.pipe(csvWriteStream);

  filesService.downloadToStream(csvHandle)(csvStream);

  await filesService.uploadFromStream(csvOutHandle)(csvWriteStream);
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

  const processDataFn = processDataThroughWorker({
    personaImportId: id,
    structure,
    personaService,
    organisation
  });

  let rowIndex = 0;
  const processPromise = highland(csvStream)
    .each((data) => {
      rowIndex += 1;
      processDataFn(data, rowIndex);
    })
    .collect()
    .toPromise(Promise);

  filesService.downloadToStream(csvHandle)(csvStream);

  await processPromise;

  await PersonasImport.updateOne({
    _id: id
  }, {
    totalCount: rowIndex
  });

  const personaImportWithTotalCount = await PersonasImport.findOne({
    _id: id
  });

  if (
    personaImportWithTotalCount.processedCount >= personaImportWithTotalCount.totalCount &&
    personaImportWithTotalCount.importStage === STAGE_PROCESSING
  ) {
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
  if (personaImport.importStage === STAGE_PROCESSING) throw new AlreadyProcessingError('personasImport', id);

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
