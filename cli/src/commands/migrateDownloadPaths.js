import highland from 'highland';
import logger from 'lib/logger';
import Download from 'lib/models/download';

const count = a => a + 1;

const updateDownload = (download) => {
  const orgId = download.organisation.toString();
  const downloadId = download._id.toString();
  download.url = `/api/organisation/${orgId}/downloadexport/${downloadId}.csv`;
  return highland(download.save());
};

const logAndExit = (totalCount) => {
  logger.info(`Updated ${totalCount} downloads.`);
  process.exit();
};

export default function () {
  logger.info('Updating download paths...');
  const cursor = Download.find({}).cursor();

  const downloadStream = highland(cursor);
  downloadStream.on('error', (err) => {
    logger.error(err);
    process.exit();
  });

  downloadStream
    .map(updateDownload)
    .parallel(10)
    .reduce(0, count)
    .apply(logAndExit);
}
