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

export default {
  uploadPersonas,
  importPersonas,
  importPersonasError
};
