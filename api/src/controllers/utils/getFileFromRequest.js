import multiparty from 'multiparty';
import Promise from 'bluebird';
import logger from 'lib/logger';

export default req => new Promise((resolve, reject) => {
  const form = new multiparty.Form({ uploadDir: `${process.cwd()}/storage/tmp` });
  form.parse(req, (err, fields, files) => {
    logger.debug('PARSING FILES', files);
    if (err) return reject(err);
    const file = files[Object.keys(files)[0]][0];
    resolve(file);
  });
});
