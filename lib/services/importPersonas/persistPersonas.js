import fs from 'fs';
import clamscan from 'lib/services/files/clamscan';
import { uploadFromStream } from 'lib/services/files/storage';

export const PERSONAS_CSV_PATH = '/personasCsvs';

export default async ({
  file,
  id
}) => {
  const filePath = file.path;

  await clamscan(filePath);
  const fileStream = fs.createReadStream(filePath);

  const fullPath = `${PERSONAS_CSV_PATH}/${id}.csv`;
  await uploadFromStream(fullPath)(fileStream);

  return fullPath;
};
