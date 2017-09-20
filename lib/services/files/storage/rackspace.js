import {
  createClient,
  createStreamUploader,
  createPathUploader,
  createStreamDownloader,
} from './pkgcloud';

const client = createClient({
  provider: 'rackspace',
  username: process.env.FS_RACK_USERNAME,
  apiKey: process.env.FS_RACK_API_KEY,
  region: process.env.FS_RACK_REGION,
  useInternal: process.env.FS_RACK_USE_INTERNAL,
});

const container = process.env.FS_RACK_CONTAINER;
export const uploadFromStream = createStreamUploader(client)({ container });
export const uploadFromPath = createPathUploader(uploadFromStream);
export const downloadToStream = createStreamDownloader(client)({ container });

export default {
  uploadFromStream,
  uploadFromPath,
  downloadToStream,
};
