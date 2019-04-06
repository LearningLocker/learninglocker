import * as rackspace from './rackspace';
import * as amazon from './amazon';
import * as google from './google';
import * as local from './local';
import * as azure from './azure';

let fsRepo;

switch (process.env.FS_REPO) {
  case 'rackspace': fsRepo = rackspace; break;
  case 'amazon': fsRepo = amazon; break;
  case 'google': fsRepo = google; break;
  case 'azure': fsRepo = azure; break;
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
