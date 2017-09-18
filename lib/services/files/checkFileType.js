import path from 'path';

const missing = as => a => as.indexOf(a) === -1;
const getExt = file => path.extname(file.originalFilename);
const getMime = file => file.headers['content-type'];
const isOctetStream = mime => mime === 'application/octet-stream';
const invalidExt = ext => new Error(`Invalid file extension ${ext}`);
const invalidMime = mime => new Error(`Invalid mimetype ${mime}`);
const checkExtType = allowedExts => (ext) => {
  if (missing(allowedExts)(ext)) return invalidExt(ext);
};
export default allowedMimes => allowedExts => (file) => {
  const mime = getMime(file);
  if (isOctetStream(mime)) return checkExtType(allowedExts)(getExt(file));
  if (missing(allowedMimes)(mime)) return invalidMime(mime);
};
