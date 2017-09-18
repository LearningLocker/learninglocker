import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  PERSONA_ALLOWED_FILE_TYPES,
  PERSONA_ALLOWED_FILE_EXT,
  LOGO_ALLOWED_FILE_TYPES,
  LOGO_ALLOWED_FILE_EXT,
  ERROR_MESSAGE
} from 'lib/constants/uploads';

const makeDirectory = (dir, cb) => {
  fs.exists(dir, (exists) => {
    if (exists) {
      cb(null, dir);
    } else {
      fs.mkdir(dir, err => cb(err, dir));
    }
  });
};

// PEOPLE CSV UPLOAD STORAGE
const peopleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    makeDirectory(path.join(__dirname, '../../uploads'), cb);
  },
  filename: (req, file, cb) => {
    cb(null, `${+Date.now()}-${file.originalname}`);
  }
});

const checkFileType = (file, allowedMime, allowedExt, cb) => {
  // no mimetype was sent (chrome just gave up), check the file type as a last resort
  if (file.mimetype === 'application/octet-stream') {
    const fileExt = path.extname(file.originalname);
    if (allowedExt.indexOf(fileExt) === -1) {
      return cb(new Error('Invalid file extension'));
    }
    return cb(null);
  }

  // otherwise lets check the mimetype
  if (allowedMime.indexOf(file.mimetype) === -1) {
    return cb(new Error('Invalid mimetype'));
  }

  return cb(null);
};

export const peopleMulter = multer({
  storage: peopleStorage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, PERSONA_ALLOWED_FILE_TYPES, PERSONA_ALLOWED_FILE_EXT, (err) => {
      if (err) {
        req.fileValidationError = ERROR_MESSAGE;
        return cb(null, false, new Error(ERROR_MESSAGE));
      }
      return cb(null, true);
    });
  }
});

// LOGO UPLOAD STORAGE
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../static/logos'));
  },
  filename: (req, file, cb) => {
    cb(null, `${+Date.now()}-${file.originalname}`);
  }
});

export const logoMulter = multer({
  storage: logoStorage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, LOGO_ALLOWED_FILE_TYPES, LOGO_ALLOWED_FILE_EXT, (err) => {
      if (err) {
        req.fileValidationError = ERROR_MESSAGE;
        return cb(null, false, new Error(ERROR_MESSAGE));
      }
      return cb(null, true);
    });
  }
});
