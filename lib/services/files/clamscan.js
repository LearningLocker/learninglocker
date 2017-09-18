import Promise from 'bluebird';
import logger from 'lib/logger';

const scanError = err => (
  new Error(`Something went wrong when scanning the file. ${err.message}`)
);
const virusError = () => (
  new Error('This file has not passed the virus scan and will be deleted.')
);
export default filePath => new Promise((resolve, reject) => {
  if (!process.env.CLAMSCAN_BINARY) {
    logger.warn('CLAMSCAN NOT INSTALLED, SEE DOCS FOR FURTHER INFORMATION.');
    return resolve(filePath);
  }
  try {
    const clam = require('clamscan')({
      remove_infected: true,
      clamscan: {
        path: process.env.CLAMSCAN_BINARY,
      },
      preference: 'clamscan',
    });

    clam.is_infected(filePath, (err, file, isInfected) => {
      if (err) return reject(scanError(err));
      if (isInfected) return reject(virusError());
      return resolve(filePath);
    });
  } catch (err) {
    return reject(scanError(err));
  }
});
