import fs from 'fs';
import { uploadFromStream } from 'lib/services/files/storage';

export const PERSONAS_CSV_PATH = 'personasCsvs';

export default async ({
  file,
  id,
}) => {
  const filePath = file.path;

  const fileStream = fs.createReadStream(filePath);

  const fullPath = `${PERSONAS_CSV_PATH}/${id}.csv`;
  await uploadFromStream(fullPath)(fileStream);

  const fullErrorPath = `${PERSONAS_CSV_PATH}/${id}-error.csv`;

  return {
    csvHandle: fullPath,
    csvErrorHandle: fullErrorPath
  };
};
