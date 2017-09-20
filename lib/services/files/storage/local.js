import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import Promise from 'bluebird';
import logger from 'lib/logger';
import defaultTo from 'lodash/defaultTo';
import { createPathUploader } from './pkgcloud';

const endpoint = defaultTo(process.env.FS_LOCAL_ENDPOINT, process.cwd());
const subfolder = defaultTo(process.env.FS_SUBFOLDER, 'storage');

const getFullPath = localPath => path.join(endpoint, subfolder, localPath);

export const uploadFromStream = toPath => fromStream => new Promise((resolve, reject) => {
  const fullPath = getFullPath(toPath);
  const folderPath = path.dirname(fullPath);
  logger.debug('UPLOADING TO', fullPath);

  // ensures that the directory exists as long as we have enough permissions
  mkdirp(folderPath, (err) => {
    if (err) return reject(err);
    const writeStream = fs.createWriteStream(fullPath);
    writeStream.on('error', reject);
    writeStream.on('finish', resolve);
    fromStream.pipe(writeStream);
  });
});
export const uploadFromPath = createPathUploader(uploadFromStream);
export const downloadToStream = fromPath => toStream =>
  new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(getFullPath(fromPath));
    logger.debug('DOWNLOADING FROM', fromPath);
    toStream.on('error', reject);
    toStream.on('success', resolve);
    readStream.pipe(toStream);
  });
