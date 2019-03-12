import {
  Aborter,
  StorageURL,
  SharedKeyCredential,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  uploadStreamToBlockBlob,
} from '@azure/storage-blob';
import { join } from 'path';
import { defaultTo } from 'lodash';
import { createPathUploader } from './pkgcloud';

const account = process.env.FS_AZURE_ACCOUNT;
const accountKey = process.env.FS_AZURE_ACCOUNT_KEY;
const containerName = process.env.FS_AZURE_CONTAINER_NAME;
const subfolder = defaultTo(process.env.FS_SUBFOLDER, 'storage');

const credential = new SharedKeyCredential(account, accountKey);

const pipeline = StorageURL.newPipeline(credential);

const serviceURL = new ServiceURL(
  `https://${account}.blob.core.windows.net`,
  pipeline
);

const getPrefixedPath = path => join(subfolder, path);

export const uploadFromStream = toPath => async (fromStream) => {
  const blobName = getPrefixedPath(toPath);
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);

  const blobUrl = BlobURL.fromContainerURL(containerURL, blobName);
  const blockBlobURL = BlockBlobURL.fromBlobURL(blobUrl);

  // A promise
  return uploadStreamToBlockBlob(Aborter.none, fromStream, blockBlobURL);
};

export const uploadFromPath = createPathUploader(uploadFromStream);

export const downloadToStream = fromPath => async (toStream) => {
  const blobName = getPrefixedPath(fromPath);
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);

  const blobUrl = BlobURL.fromContainerURL(containerURL, blobName);

  const downloadBlockBlobResponse = await blobUrl.download(Aborter.none, 0);

  downloadBlockBlobResponse.readableStreamBody.pipe(toStream);
};
