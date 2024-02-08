import logger from 'lib/logger';
import fs from 'fs';
import { addCSVToQueue } from 'lib/services/persona';
import {
  PERSONA_ALLOWED_FILE_TYPES,
  PERSONA_ALLOWED_FILE_EXT
} from 'lib/constants/uploads';
import checkFileType from 'lib/services/files/checkFileType';
import getUserIdFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getUserIdFromAuthInfo';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import MediaTypeError from 'lib/errors/MediaTypeError';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';

const checkPersonaFile = checkFileType(PERSONA_ALLOWED_FILE_TYPES)(
  PERSONA_ALLOWED_FILE_EXT
);

export default async ({ authInfo, file }) => {
  await getScopeFilter({
    modelName: 'persona',
    actionName: 'edit',
    authInfo
  });
  const filePath = file.path;
  const fileValidationError = checkPersonaFile(file);

  if (fileValidationError) {
    await fs.promises.unlink(filePath);
    throw new MediaTypeError(fileValidationError);
  }

  const orgId = getOrgFromAuthInfo(authInfo);
  const userId = getUserIdFromAuthInfo(authInfo);
  const fileStream = fs.createReadStream(filePath);

  logger.verbose('ADDING CSV TO PARSE QUEUE', filePath);
  return new Promise((resolve, reject) => {
    addCSVToQueue(fileStream, orgId, userId, async (err, result) => {
      if (err) return reject(err);
      await fs.promises.unlink(filePath);
      return resolve({
        message: 'Upload complete, adding people...',
        modelId: result
      });
    });
  });
};
