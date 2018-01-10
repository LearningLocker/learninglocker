import Storage from '@google-cloud/storage';
import defaultTo from 'lodash/defaultTo';
import { join } from 'path';
import { createPathUploader } from './pkgcloud';

const keyFilename = process.env.FS_GOOGLE_CLOUD_KEY_FILENAME;
const projectId = process.env.FS_GOOGLE_CLOUD_PROJECT_ID;
const bucketName = process.env.FS_GOOGLE_CLOUD_BUCKET;
const subfolder = defaultTo(process.env.FS_SUBFOLDER, 'storage');

const storage = new Storage({ projectId, keyFilename });


const getPrefixedPath = path => join(subfolder, path);

export const uploadFromStream = toPath => fromStream => new Promise((resolve, reject) => {
  const fullPath = getPrefixedPath(toPath);
  const file = storage.bucket(bucketName).file(fullPath);
  const writeStream = file.createWriteStream();
  writeStream.on('error', reject);
  writeStream.on('finish', resolve);
  fromStream.pipe(writeStream);
});

export const uploadFromPath = createPathUploader(uploadFromStream);

export const downloadToStream = fromPath => toStream =>
  new Promise((resolve, reject) => {
    const file = storage.bucket(bucketName).file(getPrefixedPath(fromPath));
    const readStream = file.createReadStream();
    toStream.on('error', reject);
    toStream.on('success', resolve);
    readStream.pipe(toStream);
  });
