import PersonasImport from 'lib/models/personasImport';
import * as filesService from 'lib/services/files';
import csv from 'fast-csv';
import highland from 'highland';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import {
  STAGE_IMPORTED
} from 'lib/constants/personasImport';
import NotFoundError from 'lib/errors/NotFoundError';
import proccessData from './importPersona';

const importPersonas = async ({
  id,
  personaService,
  authInfo
}) => {
  const filter = await getScopeFilter({
    modelName: 'personasImport',
    actionName: 'editAllScope',
    authInfo
  });

  const personaImport = await PersonasImport.findOne({
    _id: id,
    ...filter
  });
  if (!personaImport) throw new NotFoundError();

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

  await proccessPromise;

  const personasImport = await PersonasImport.findOneAndUpdate({
    _id: id
  }, {
    importStage: STAGE_IMPORTED,
  }, {
    new: true
  });

  return personasImport;
};

export default importPersonas;
