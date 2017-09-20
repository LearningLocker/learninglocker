import ImportCsv from 'lib/models/importcsv';
import logger from 'lib/logger';

export default (importId, done) => {
  ImportCsv.findByIdAndUpdate(importId, {
    $set: {
      'uploadStatus.inProgress': false,
      'uploadStatus.totalCount': 0,
      'uploadStatus.remainingCount': 0
    }
  }, (err) => {
    if (err) return done(err);
    logger.info('COMPLETED UPLOAD FOR', importId);
    return done(null, { count: 0 });
  });
};
