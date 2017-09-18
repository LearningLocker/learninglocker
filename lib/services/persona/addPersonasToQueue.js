import ImportCsv from 'lib/models/importcsv';
import { PERSON_UPLOAD_QUEUE } from 'lib/constants/uploads';
import * as Queue from 'lib/services/queue';
import logger from 'lib/logger';
import highland from 'highland';
import { map } from 'lodash';
import { resetUploadProgress } from 'lib/services/persona';

const addUploadDataToQueue = (dataIds, importId) =>
   highland(
    Queue.publish({
      queueName: PERSON_UPLOAD_QUEUE,
      payload: {
        dataIds,
        importId
      }
    })
    .then(() => {
      logger.debug('ADDED BATCH OF UP TO 100 UPLOADS TO PROCESS QUEUE', importId);
      return dataIds.length;
    }))
;

export const setUploadCounts = (importId, count, done) => {
  ImportCsv.findByIdAndUpdate(importId, {
    $set: {
      'uploadStatus.totalCount': count,
      'uploadStatus.remainingCount': count,
      'uploadStatus.inProgress': true
    }
  }, (err) => {
    if (err) return done(err);
    return done(null, { count });
  });
};

export default ({ importId, dataStream }, done) => {
  // add each item to the queue in batches of 100 and maintain a total count
  dataStream
    .batch(100)
    .flatMap(data => addUploadDataToQueue(map(data, '_id'), importId))
    .reduce(0, (count, dataCount) =>
       count + dataCount
    )
    .flatten()
    .apply((count) => {
      if (count > 0) {
        return setUploadCounts(importId, count, done);
      }
      logger.debug('NO DATA FOUND FOR IMPORT', importId, 'RESETTING');
      return resetUploadProgress(importId, done);
    });
};
