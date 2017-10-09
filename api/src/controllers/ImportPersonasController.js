import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getFileAndFieldsFromRequest from 'api/controllers/utils/getFileAndFieldsFromRequest';

import uploadPersonasService from 'lib/services/importPersonas/uploadPersonas';

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

export default {
  uploadPersonas
};
