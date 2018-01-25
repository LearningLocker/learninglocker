import PersonasImport from 'lib/models/personasImport';
import * as filesService from 'lib/services/files';
import csv from 'fast-csv';
import highland from 'highland';
import { promisify } from 'bluebird';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import {
  STAGE_IMPORTED,
  STAGE_PROCESSING,
  PERSONA_IMPORT_QUEUE
} from 'lib/constants/personasImport';
import NotFoundError from 'lib/errors/NotFoundError';
import AllreadyProcessingError from 'lib/errors/AllreadyProcessingError';
import moment from 'moment';
import { groupBy, mapValues, sortBy, drop, head } from 'lodash';
import { publish } from 'lib/services/queue';
// import proccessData from './importPersona';

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
}) => async (data, i) => {
  console.log('000', PERSONA_IMPORT_QUEUE);
  await promisify(publish)({
    queueName: PERSONA_IMPORT_QUEUE,
    payload: {
      index: i,
      data,
      personaImportId,
      structure,
      organisation
    }
  });
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

  let i = 1;
  const proccessPromise = highland(csvStream)
    .flatMap((data) => {
      const out = highland(proccessDataFn(data, i));
      i += 1;
      return out;
    })
    .collect()
    .toPromise(Promise);

  filesService.downloadToStream(csvHandle)(csvStream);

  const result = await proccessPromise;

  const {
    true: merged = 0,
    false: created = 0
  } = mapValues(groupBy(result), res => res.length || 0);

  const personasImport = await PersonasImport.findOneAndUpdate({
    _id: id
  }, {
    importStage: STAGE_IMPORTED,
    importedAt: moment().toDate(),
    result: {
      created,
      merged
    }
  }, {
    new: true
  });

  addErrorsToCsv({
    personasImport,
    csvHandle
  });

  return personasImport;
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
