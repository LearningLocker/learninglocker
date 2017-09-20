import logger from 'lib/logger';
import Client from 'lib/models/client';
import LRS from 'lib/models/lrs';
import Organisation from 'lib/models/organisation';
import Visualisation from 'lib/models/visualisation';
import User from 'lib/models/user';
import async from 'async';

export default function () {
  const isodate = new Date().toISOString();
  const updateCollections = [Client, LRS, Organisation, User, Visualisation];
  const loggerNames = ['Client', 'LRS', 'Organisation', 'User', 'Visualisation'];

  async.each(
    updateCollections,
    (updateCollection, done) => {
      updateCollection.update({ createdAt: { $exists: false }, updatedAt: { $exists: false } }, { $set: { createdAt: isodate, updatedAt: isodate } }, { multi: true }, (err, results) => {
        if (err) throw new Error(err);
        if (results.nModified === 0) logger.info(`All documents have timestamps in the ${loggerNames[updateCollections.indexOf(updateCollection)]} collection.`);
        else logger.info(`Added timestamps to ${results.nModified} records in the ${loggerNames[updateCollections.indexOf(updateCollection)]} collection.`);
        done();
      });
    },
    (err) => {
      if (err) logger.error(err);
      logger.info('Completed timestamp migration, exiting ...');
      process.exit();
    }
  );
}
