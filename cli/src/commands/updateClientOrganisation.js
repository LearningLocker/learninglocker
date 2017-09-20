import logger from 'lib/logger';
import LRS from 'lib/models/lrs';
import Client from 'lib/models/client';
import async from 'async';

export default function (next = null) {
  LRS.find({}, (err, stores) => {
    async.each(
      stores,
      (store, done) => {
        logger.info(`Adding organisation to clients for ${store.title}...`);
        Client.update({ lrs_id: store._id }, { organisation: store.organisation, title: `${store.title} client` }, { multi: true }, done);
      },
      (err) => {
        if (err) logger.error(err);
        logger.info('All clients updated with an organisation.');
        if (next) {
          next();
        } else {
          process.exit();
        }
      }
    );
  });
}
