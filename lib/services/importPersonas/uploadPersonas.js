import persistPersonas from 'lib/services/importPersonas/persistPersonas';
import PersonasImport from 'lib/models/personasImport';
import { STAGE_CONFIGURE_FIELDS } from 'lib/constants/personasImport';
import getCsvHeaders from 'lib/services/importPersonas/getCsvHeaders';
import getStructure from 'lib/services/importPersonas/getStructure';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import NotFoundError from 'lib/errors/NotFoundError';

const uploadPersonas = async ({
  id,
  file,
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

  const handle = await persistPersonas({
    authInfo,
    file,
    id
  });

  const csvHeaders = await getCsvHeaders(handle);

  const structure = await getStructure(
    csvHeaders
  );

  // TODO: if back button, or re upload, re configure the structure.

  const personasImport = await PersonasImport.findOneAndUpdate({
    _id: id
  }, {
    importStage: STAGE_CONFIGURE_FIELDS,
    csvHandle: handle,
    csvHeaders,
    structure
  }, {
    new: true
  });

  return personasImport;
};

export default uploadPersonas;
