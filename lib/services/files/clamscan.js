import Promise from 'bluebird';
import logger from 'lib/logger';
import defaultTo from 'lodash/defaultTo';

const virusError = () => (
  new Error('This file has not passed the virus scan and will be deleted.')
);
export default filePath => new Promise((resolve, reject) => {
  if (!process.env.CLAMDSCAN_BINARY) {
    logger.warn('CLAMDSCAN NOT INSTALLED, SEE DOCS FOR FURTHER INFORMATION.');
    return resolve(filePath);
  }
  try {
    const clam = require('clamscan')({
      remove_infected: true,
      clamdscan: {
        path: process.env.CLAMDSCAN_BINARY,
        config_file: defaultTo(process.env.CLAMDSCAN_CONF, '/etc/clamav/clamd.conf')
      },
      preference: 'clamdscan',
    });

    clam.is_infected(filePath, (err, file, isInfected) => {
      if (err) {
        logger.warn('ERROR SCANNING FILE WITH CLAMD - ', err);
        return resolve(filePath);
      }
      if (isInfected) return reject(virusError());
      return resolve(filePath);
    });
  } catch (err) {
    logger.warn('ERROR SCANNING FILE WITH CLAMD - ', err);
    return resolve(filePath);
  }
});
