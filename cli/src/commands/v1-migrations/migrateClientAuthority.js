import logger from 'lib/logger';
import Client from 'lib/models/client';
import mongoose from 'mongoose';

const objectId = mongoose.Types.ObjectId;

const logSuccess = results =>
  logger.info(`${results.length} models updated`);

const logError = err =>
  logger.error(err);

const migrateDoc = (doc) => {
  const filter = { _id: objectId(doc._id) };
  const update = { $set: { authority: JSON.stringify(doc.authority) } };
  logger.debug(`Migrating ${doc.title} ${doc._id}`);
  return Client.update(filter, update).then(res =>
    logger.debug(`Migrated ${doc.title} ${JSON.stringify(res)}`)
  );
};

export default function () {
  logger.info('Updating clients authorities...');
  Client.find({}).lean()
    .then(docs =>
      Promise.all(docs.map((doc) => {
        const hasConstructor = doc.authority !== undefined && doc.authority !== null;
        const shouldMigrate = hasConstructor && doc.authority.constructor === Object;

        // Because the Client model currently parses the authority and returns an Object.
        // It will always migrate. So keep calm and carry on migrating.
        if (shouldMigrate) return migrateDoc(doc);

        logger.debug(`Not migrating ${doc.title}`);
        return Promise.resolve();
      }))
    )
    .then(logSuccess, logError)
    .then(() => process.exit());
}
