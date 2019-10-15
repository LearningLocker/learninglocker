import fs from 'fs';
import clamscan from 'lib/services/files/clamscan';
import { uploadFromStream } from 'lib/services/files/storage';

export const PERSONAS_JSON_PATH = 'personasJson';

export default async ({
  file,
  id,
}) => {
  const filePath = file.path;

  await clamscan(filePath);
  const fileStream = fs.createReadStream(filePath);

  const fullPath = `${PERSONAS_JSON_PATH}/${id}.json`;
  await uploadFromStream(fullPath)(fileStream);

  const fullErrorPath = `${PERSONAS_JSON_PATH}/${id}-error.json`;

  return {
    jsonHandle: fullPath,
    jsonErrorHandle: fullErrorPath
  };
};
