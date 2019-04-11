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

const BYTES_IN_KILOBYTES = 1024;
const KILOBYTES_IN_MEGABYTES = 1024;
const FOUR = 4;

// https://github.com/Azure/azure-storage-js/blob/master/blob/samples/highlevel.sample.js
const BUFFER_SIZE = FOUR * KILOBYTES_IN_MEGABYTES * BYTES_IN_KILOBYTES; // 4MB
const MAX_BUFFERS = 20;

const getPrefixedPath = path => join(subfolder, path);

const getServiceUrl = () => {
  const credential = new SharedKeyCredential(account, accountKey);
  const pipeline = StorageURL.newPipeline(credential);

  return new ServiceURL(
    `https://${account}.blob.core.windows.net`,
    pipeline
  );
};

export const uploadFromStream = toPath => async (fromStream) => {
  const serviceUrl = getServiceUrl();
  const blobName = getPrefixedPath(toPath);
  const containerURL = ContainerURL.fromServiceURL(serviceUrl, containerName);

  const blobUrl = BlobURL.fromContainerURL(containerURL, blobName);
  const blockBlobURL = BlockBlobURL.fromBlobURL(blobUrl);

  return uploadStreamToBlockBlob(Aborter.none, fromStream, blockBlobURL, BUFFER_SIZE, MAX_BUFFERS);
};

export const uploadFromPath = createPathUploader(uploadFromStream);

export const downloadToStream = fromPath => async (toStream) => {
  const serviceUrl = getServiceUrl();
  const blobName = getPrefixedPath(fromPath);
  const containerURL = ContainerURL.fromServiceURL(serviceUrl, containerName);

  const blobUrl = BlobURL.fromContainerURL(containerURL, blobName);

  const downloadBlockBlobResponse = await blobUrl.download(Aborter.none, 0);

  downloadBlockBlobResponse.readableStreamBody.pipe(toStream);
};
