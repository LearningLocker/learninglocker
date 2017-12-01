import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getFileAndFieldsFromRequest from 'api/controllers/utils/getFileAndFieldsFromRequest';
// import getFieldsFromRequest from 'api/controllers/utils/getFieldsFromRequest';

import uploadPersonasService from 'lib/services/importPersonas/uploadPersonas';
import importPersonasService from 'lib/services/importPersonas/importPersonas';

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

  const personasImport = await importPersonasService({
    id,
    authInfo,
    personaService: req.personaService
  });

  return res.status(200).json(personasImport);
});

export default {
  uploadPersonas,
  importPersonas
};
