import multiparty from 'multiparty';
import Promise from 'bluebird';
import logger from 'lib/logger';
import { mapValues } from 'lodash';

export default req => new Promise((resolve, reject) => {
  const form = new multiparty.Form({ uploadDir: `${process.cwd()}/storage/tmp` });
  form.parse(req, (err, fields, files) => {
    logger.debug('PARSING FILES', files);
    if (err) return reject(err);
    let file;
    try {
      file = files[Object.keys(files)[0]][0];
    } catch (err) {
      return reject(new Error('No file found'));
    }
    resolve({ file, fields: mapValues(fields, value => value[0]) });
  });
});
