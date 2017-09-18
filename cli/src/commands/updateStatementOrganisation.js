import logger from 'lib/logger';
import { getConnection } from 'lib/connections/mongoose';
import async from 'async';

export default function (next = null) {
  const Lrs = getConnection().model('LRS');
  const Statement = getConnection().model('Statement');

  Lrs.find({}, (err, stores) => {
    logger.info(`Found ${stores.length} stores to update organisation on.`);
    async.each(stores,
      (store, asyncdone) => {
        Statement.update({ lrs_id: store._id }, { organisation: store.organisation }, { multi: true }, asyncdone);
        logger.info(`Adding organisation to statements in ${store.title}`);
      },
      (err) => {
        if (err) logger.error(err);
        logger.info('All statements updated with an organisation');
        if (next) {
          next();
        } else {
          process.exit();
        }
      }
    );
  });
}
