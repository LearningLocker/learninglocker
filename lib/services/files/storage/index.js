import * as rackspace from './rackspace';
import * as amazon from './amazon';
import * as local from './local';

let fsRepo;

switch (process.env.FS_REPO) {
  case 'rackspace': fsRepo = rackspace; break;
  case 'amazon': fsRepo = amazon; break;
  default: fsRepo = local; break;
}

const uploadFromStream = fsRepo.uploadFromStream;
const uploadFromPath = fsRepo.uploadFromPath;
const downloadToStream = fsRepo.downloadToStream;

export {
  uploadFromStream,
  uploadFromPath,
  downloadToStream
};
