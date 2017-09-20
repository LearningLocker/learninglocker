import Promise from 'bluebird';
import logger from 'lib/logger';
import Client from 'lib/models/client';
import Statement from 'lib/models/statement';
import mongoose from 'mongoose';

const objectId = mongoose.Types.ObjectId;

const logSuccess = results =>
  logger.info(`${results.length} clients updated`);

const logError = err =>
  logger.error(err);

const migrateDoc = (client) => {
  const filter = {
    client_id: client._id.toString()
  };
  const update = { client: objectId(client._id) };
  const options = { multi: true, runValidators: false };

  logger.debug(`Migrating ${client.title} ${client._id}`);
  return Statement.update(filter, update, options).then(res =>
    logger.debug(`Migrated ${client.title} ${JSON.stringify(res)}`)
  );
};

export default function () {
  logger.info('Updating statement client ids...');
  Client.find({}).lean()
    .then(docs =>
      Promise.mapSeries(docs, doc => migrateDoc(doc))
    )
    .then(logSuccess, logError)
    .then(() => process.exit());
}
