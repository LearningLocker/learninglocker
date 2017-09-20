import pkgcloud from 'pkgcloud';
import fs from 'fs';
import Promise from 'bluebird';
import logger from 'lib/logger';
import defaultTo from 'lodash/defaultTo';
import { join } from 'path';

const subfolder = defaultTo(process.env.FS_SUBFOLDER, 'storage');

const getPrefixedPath = path => join(subfolder, path);

const uploadToClient = client => config => path => client.upload({
  ...config,
  remote: getPrefixedPath(path),
});

const downloadFromClient = client => config => path => client.download({
  ...config,
  remote: getPrefixedPath(path),
});

export const createClient = config => pkgcloud.storage.createClient(config);
export const createStreamUploader = client => config => toPath => fromStream =>
  new Promise((resolve, reject) => {
    const writeStream = uploadToClient(client)(config)(toPath);
    logger.debug('UPLOADING TO', toPath);
    writeStream.on('error', reject);
    writeStream.on('success', resolve);
    fromStream.pipe(writeStream);
  });
export const createPathUploader = streamUploader => toPath => (fromPath) => {
  const fromStream = fs.createReadStream(fromPath);
  return streamUploader(toPath)(fromStream);
};
export const createStreamDownloader = client => config => fromPath => toStream =>
  new Promise((resolve, reject) => {
    const readStream = downloadFromClient(client)(config)(fromPath);
    logger.debug('DOWNLOADING FROM', fromPath);
    toStream.on('error', reject);
    toStream.on('success', resolve);
    readStream.pipe(toStream);
  });

export default {
  createClient,
  createStreamUploader,
  createPathUploader,
  createStreamDownloader,
};
