import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getFileAndFieldsFromRequest from 'api/controllers/utils/getFileAndFieldsFromRequest';
import getPersonaService from 'lib/connections/personaService';
import uploadPersonasService from 'lib/services/importPersonas/uploadPersonas';
import importPersonasService from 'lib/services/importPersonas/importPersonas';
import { downloadToStream } from 'lib/services/files';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import PersonasImport from 'lib/models/personasImport';
import mongoose from 'mongoose';

import persistJsonPersonas from 'lib/services/importPersonas/persistJsonPersonas';
import { IMPORT_JSON } from 'lib/constants/personasImport';
import importJsonPersonasService from 'lib/services/importPersonas/importJsonPersonas';

const objectId = mongoose.Types.ObjectId;

const uploadPersonas = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);
  const { file, fields: { id } } = await getFileAndFieldsFromRequest(req);

  const personasImport = await uploadPersonasService({
    id,
    file,
    authInfo
  });

  return res.status(200).json(personasImport);
});

const importPersonas = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const { id } = req.body;

  const personaService = getPersonaService();
  const { personaImport } = await importPersonasService({
    id,
    authInfo,
    personaService,
  });

  return res.status(200).json(personaImport);
});

const importPersonasError = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const id = req.params.id;

  const filter = await getScopeFilter({
    modelName: 'personasImport',
    actionName: 'view',
    authInfo
  });

  const personaImport = await PersonasImport.findOne({
    _id: objectId(id),
    ...filter
  });

  const csvHandle = personaImport.csvErrorHandle || personaImport.csvHandle;

  res.header('Content-Type', 'text/csv');
  return downloadToStream(csvHandle)(res);
});

const uploadJsonPersonas = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const { file } = await getFileAndFieldsFromRequest(req);

  const personaImport = await PersonasImport.create({
    importType: IMPORT_JSON
  });

  const {
    jsonHandle,
    jsonErrorHandle
  } = await persistJsonPersonas({
    authInfo,
    file,
    id: personaImport._id
  });

  await personaImport.updateOne({
    _id: personaImport._id
  }, {
    jsonHandle,
    jsonErrorHandle,
    title: !personaImport.title ? file.originalFilename : personaImport.title,
  });

  await importJsonPersonasService({
    id: personaImport._id,
    personaService: getPersonaService(),
    authInfo,
  });

  return res.status(200).json(personaImport);
});

export default {
  uploadPersonas,
  importPersonas,
  importPersonasError,
  uploadJsonPersonas
};
