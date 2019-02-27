import fs from 'fs';
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
    actionName: 'edit',
    authInfo
  });

  const personaImport = await PersonasImport.findOne({
    _id: id,
    ...filter
  });
  if (!personaImport) throw new NotFoundError();

  const {
    csvHandle,
    csvErrorHandle
  } = await persistPersonas({
    authInfo,
    file,
    id
  });

  // instead of going back out to s3, use the local file we already have!
  const filePath = file.path;
  const fileStream = fs.createReadStream(filePath);
  const csvHeaders = await getCsvHeaders(fileStream);

  const structure = await getStructure({
    csvHeaders,
    filter
  });

  await PersonasImport.updateOne({
    _id: id
  }, {
    importStage: STAGE_CONFIGURE_FIELDS,
    csvHandle,
    csvErrorHandle,
    csvHeaders,
    structure,
    title: !personaImport.title ? file.originalFilename : personaImport.title,
  });

  return await PersonasImport.findOne({
    _id: id
  });
};

export default uploadPersonas;
