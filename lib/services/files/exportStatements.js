import path from 'path';
import Promise from 'bluebird';
import moment from 'moment';
import mongoose from 'mongoose';
import { exportCSV } from 'api/utils/exports';
import { uploadFromStream } from 'lib/services/files/storage';
import logger from 'lib/logger';
import Export from 'lib/models/export';
import Download from 'lib/models/download';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import NotFoundError from 'lib/errors/NotFoundError';

const objectId = mongoose.Types.ObjectId;

const exportToStream = async ({
  authInfo,
  pipelines,
  type,
  csvPath,
  downloadModel
}) => {
  try {
    const stream = await exportCSV({ authInfo, pipelines, type });
    await uploadFromStream(csvPath)(stream);
    downloadModel.isReady = true;
    return await downloadModel.save();
  } catch (err) {
    logger.error(err);
  }
};

export default async ({ authInfo, exportId, pipelines, type }) => {
  const csvPath = path.join('downloads', `${Date.now()}.csv`);
  const idFilter = { _id: exportId };
  const scopeFilter = await getScopeFilter({
    modelName: 'export',
    actionName: 'view',
    authInfo
  });
  const filter = { $and: [idFilter, scopeFilter] };
  const exportModel = await Export.findOne(filter);
  if (exportModel === null) throw new NotFoundError('export', exportId);

  // Create a new download model for these pipelines
  const creationTime = moment();
  const downloadId = objectId();
  const orgId = exportModel.organisation;
  const downloadModel = await Download.create({
    _id: downloadId,
    time: creationTime,
    owner: exportModel.owner,
    organisation: orgId,
    name: `${exportModel.name} - ${creationTime.format('DD-MM-YYYY - HH:mm:ss')}`,
    upload: {
      mime: 'text/csv',
      key: csvPath,
      repo: process.env.FS_REPO
    },
    url: `/api/organisation/${orgId}/downloadexport/${downloadId}.csv`
  });

  // turn the pipelines into a csv on whatever storage is configured (local, AWS, etc)
  const makeCSV = exportToStream({
    authInfo,
    pipelines,
    type,
    csvPath,
    downloadModel
  });

  // if saving the file takes longer than 2 seconds
  // continue saving in the background but return to the user
  const updatedModel = await Promise.any([Promise.delay(2000), makeCSV]);
  return updatedModel || downloadModel;
};
