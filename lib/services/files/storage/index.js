import * as rackspace from './rackspace';
import * as amazon from './amazon';
import * as google from './google';
import * as local from './local';

let fsRepo;

export const RACKSPACE = 'rackspace';
export const AMAZON = 'amazon';
export const GOOGLE = 'google';
export const LOCAL = 'local';

switch (process.env.FS_REPO) {
  case RACKSPACE: fsRepo = rackspace; break;
  case AMAZON: fsRepo = amazon; break;
  case GOOGLE: fsRepo = google; break;
  default: fsRepo = local; break;
}

const uploadFromStream = fsRepo.uploadFromStream;
const uploadFromPath = fsRepo.uploadFromPath;
const downloadToStream = fsRepo.downloadToStream;

export const factory = (repoType) => {
  switch (repoType) {
    case RACKSPACE: return rackspace;
    case AMAZON: return amazon;
    case GOOGLE: return google;
    default: return local;
  }
};

export {
  uploadFromStream,
  uploadFromPath,
  downloadToStream
};
