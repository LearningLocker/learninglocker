import logger from 'lib/logger';
import Download from 'lib/models/download';
import mongoose from 'mongoose';

const objectId = mongoose.Types.ObjectId;

const logSuccess = results =>
  logger.info(`${results.length} models updated`);

const logError = err =>
  logger.error(err);

const migrateDoc = (doc) => {
  const filter = { _id: objectId(doc._id) };
  const update = { $set: { url: `${doc.url}.csv` } };
  logger.debug(`Migrating ${doc.name} ${doc._id}`);
  return Download.update(filter, update).then(res =>
    logger.debug(`Migrated ${doc.name} ${JSON.stringify(res)}`)
  );
};

export default function () {
  logger.info('Updating download URLs to be CSVs...');
  Download.find({}).lean()
    .then(docs =>
      Promise.all(docs.map((doc) => {
        const shouldMigrate = doc.url.indexOf('.csv') !== (doc.url.length - 4);
        if (shouldMigrate) return migrateDoc(doc);
        logger.debug(`Not migrating ${doc.name}`);
        return Promise.resolve();
      }))
    )
    .then(logSuccess, logError)
    .then(() => process.exit());
}
