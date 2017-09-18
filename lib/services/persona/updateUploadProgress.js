import ImportCsv from 'lib/models/importcsv';
import logger from 'lib/logger';
import { resetUploadProgress } from 'lib/services/persona';

export default ({ importId, dataIds }, done) => {
  ImportCsv.findByIdAndUpdate(importId, {
    $inc: {
      'uploadStatus.remainingCount': -dataIds.length
    }
  }, {
    new: true
  }, (err, importModel) => {
    if (err) return done(err);
    if (!importModel) {
      logger.verbose('COULD NOT FIND IMPORT, CLEARING JOB');
      return done(null, { count: 0 });
    }

    logger.info(`BATCH DONE FOR importId ${importId.toString()}, ${importModel.uploadStatus.remainingCount} remaining`);
    if (importModel.uploadStatus.remainingCount === 0) return resetUploadProgress(importId, done);
    return done(null);
  });
};
