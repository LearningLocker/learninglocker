import highland from 'highland';
import mongoose from 'mongoose';
import ImportData from 'lib/models/importdata';
import logger from 'lib/logger';

export default (importId) => {
  logger.info('importId', importId);
  const query = {
    importModel: new mongoose.Types.ObjectId(importId),
  };
  return highland(ImportData.find(query).cursor());
};
