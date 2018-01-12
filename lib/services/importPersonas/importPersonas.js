import PersonasImport from 'lib/models/personasImport';
import * as filesService from 'lib/services/files';
import csv from 'fast-csv';
import highland from 'highland';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import {
  STAGE_IMPORTED,
  STAGE_PROCESSING
} from 'lib/constants/personasImport';
import NotFoundError from 'lib/errors/NotFoundError';
import AllreadyProcessingError from 'lib/errors/AllreadyProcessingError';
import moment from 'moment';
import { groupBy, mapValues } from 'lodash';
import proccessData from './importPersona';


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

  const proccessDataFn = proccessData({
    structure,
    personaService,
    organisation
  });

  const proccessPromise = highland(csvStream)
    .flatMap(data =>
      highland(proccessDataFn(data))
    )
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
