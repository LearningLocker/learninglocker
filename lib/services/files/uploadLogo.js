import fs from 'fs';
import {
  LOGO_ALLOWED_FILE_TYPES,
  LOGO_ALLOWED_FILE_EXT
} from 'lib/constants/uploads';
import Organisation from 'lib/models/organisation';
import { runScopeFilterWithOrg } from 'lib/services/auth/modelFilters/organisation';
import checkFileType from 'lib/services/files/checkFileType';
import { uploadFromPath } from 'lib/services/files/storage';

const checkLogoFile = checkFileType(LOGO_ALLOWED_FILE_TYPES)(
  LOGO_ALLOWED_FILE_EXT
);
const updateOrg = async (fileKey, fileMime, org) => {
  const newPath = `/api/downloadlogo/${org._id}`;
  org.logo = {
    key: fileKey,
    mime: fileMime,
    repo: process.env.FS_REPO
  };
  org.logoPath = newPath;
  await org.save();
  return newPath;
};

export default async ({ authInfo, orgId, file }) => {
  await runScopeFilterWithOrg({
    actionName: 'edit',
    authInfo
  })(orgId);
  const tempPath = file.path;
  const fileValidationError = checkLogoFile(file);
  const fileMime = file.headers['content-type'];
  const deleteTempFile = () => fs.promises.unlink(tempPath);
  const fileKey = `logos/${orgId}`;
  if (fileValidationError) throw fileValidationError;

  try {
    await uploadFromPath(fileKey)(tempPath);
    const org = await Organisation.findById(orgId).exec();
    const uploadPath = await updateOrg(fileKey, fileMime, org);
    await deleteTempFile();
    return uploadPath;
  } catch (err) {
    await deleteTempFile();
    throw err;
  }
};
