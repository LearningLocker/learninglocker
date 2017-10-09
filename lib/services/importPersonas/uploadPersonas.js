import persistPersonas from 'lib/services/importPersonas/persistPersonas';
import PersonasImport from 'lib/models/personasImport';
import { STAGE_CONFIGURE_FIELDS } from 'lib/constants/personasImport';
import getCsvHeaders from 'lib/services/importPersonas/getCsvHeaders';

const uploadPersonas = async ({
  id,
  file,
  authInfo
}) => {
  const handle = await persistPersonas({
    authInfo,
    file,
    id
  });

  const csvHeaders = await getCsvHeaders(handle);

  // TODO: if back button, or re upload, re configure the structure.

  const personasImport = await PersonasImport.findOneAndUpdate({
    _id: id
  }, {
    importStage: STAGE_CONFIGURE_FIELDS,
    csvHandle: handle,
    csvHeaders,
  }, {
    new: true
  });

  return personasImport;
};

export default uploadPersonas;
