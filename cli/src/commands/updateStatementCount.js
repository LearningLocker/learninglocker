import logger from 'lib/logger';
import Lrs from 'lib/models/lrs';
import Statement from 'lib/models/statement';
import async from 'async';

export default function () {
  Lrs.find({}, (err, stores) => {
    logger.info(`Found ${stores.length} stores to update count on.`);
    async.each(stores,
      (store, asyncdone) => {
        Statement.count({ lrs_id: store._id, active: true }, (err, count) => {
          if (err) asyncdone(err);
          store.statementCount = count;
          store.save(asyncdone);
        });
      },
      (err) => {
        if (err) logger.error(err);
        logger.info('Statement counts updated');
        process.exit();
      }
    );
  });
}
