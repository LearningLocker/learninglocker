import async from 'async';
import logger from 'lib/logger';
import { getPersonaIdentifierFromDoc, updateUploadProgress } from 'lib/services/persona';
import ImportData from 'lib/models/importdata';
import ImportCsv from 'lib/models/importcsv';

const handleDataUpload = (importId, dataId, done) => {
  async.parallel({
    importModel: next => ImportCsv.findById(importId, next),
    dataModel: next => ImportData.findById(dataId, next)
  }, (err, { importModel, dataModel }) => {
    if (err) return done(err);
    if (!dataModel || !importModel) {
      logger.debug('dataModel or importModel NOT FOUND, returning job as done');
      return done(null);
    }
    getPersonaIdentifierFromDoc(dataModel, importModel, (err) => {
      if (err) {
        logger.error('PROCESSING UPLOAD DATA FAILED', err);
        dataModel.remove();
        logger.verbose('REMOVED DATAMODEL', dataModel._id);
        return done(err);
      }
      logger.verbose('UPLOAD ROW COMPLETED', { dataId });
      dataModel.remove();
      done(null);
    });
  });
};

export default ({ dataIds, importId }, jobDone) => {
  logger.info(`STARTING PERSONA UPLOAD BATCH ON ${dataIds.length} dataIds for importId ${importId}`);
  async.each(
    dataIds,
    handleDataUpload.bind(null, importId),
    (err) => {
      if (err) {
        logger.error('UPLOAD DATA FAILED on importId', importId);
      }
      return updateUploadProgress({ importId, dataIds }, jobDone);
    }
  );
};
