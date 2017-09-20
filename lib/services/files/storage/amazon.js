import {
  createClient,
  createStreamUploader,
  createPathUploader,
  createStreamDownloader,
} from './pkgcloud';

const client = createClient({
  provider: 'amazon',
  keyId: process.env.FS_AWS_S3_ACCESS_KEY_ID,
  key: process.env.FS_AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.FS_AWS_S3_REGION,
});

const container = process.env.FS_AWS_S3_BUCKET;
export const uploadFromStream = createStreamUploader(client)({ container });
export const uploadFromPath = createPathUploader(uploadFromStream);
export const downloadToStream = createStreamDownloader(client)({ container });

export default {
  uploadFromStream,
  uploadFromPath,
  downloadToStream,
};
