import logger from 'lib/logger';
import Lrs from 'lib/models/lrs';
import Statement from 'lib/models/statement';

export default function () {
  Lrs.find({}, async (err, stores) => {
    logger.info(`Found ${stores.length} stores to update count on.`);
    await stores.reduce(async (promise, store) => {
      await promise;
      logger.info(`Updating count on ${store.title}`);
      const count = await Statement.countDocuments({ lrs_id: store._id });
      store.statementCount = count;
      await store.save();
      logger.info('Saved');
    }, Promise.resolve());
    process.exit();
  });
}
