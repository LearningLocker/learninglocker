import mongoose from 'mongoose';
import boolean from 'boolean';
import * as redis from 'lib/connections/redis';
import logger from 'lib/logger';
import { get } from 'lodash';
import { each } from 'bluebird';
import SiteSettings from 'lib/models/siteSettings';
import BatchDelete, { inWindow, nextRunAtDateTime } from 'lib/models/batchDelete';
import { SITE_SETTINGS_ID } from 'lib/constants/siteSettings';
import moment from 'moment';
import { publish as publishQueue } from 'lib/services/queue';
import { BATCH_STATEMENT_DELETION_QUEUE } from 'lib/constants/batchDelete';
import cachePrefix from 'lib/helpers/cachePrefix';

const objectId = mongoose.Types.ObjectId;
const redisClient = redis.createClient();

const BATCH_STATEMENT_DELETION_LOCK_TIMEOUT_SEC = 30;
const BATCH_STATEMENT_DELETION_CACHE_KEY = cachePrefix('BATCH_STATEMENT_DELETION_SCHEDULER:RUNNING');
const runBatchDelete = async ({
  publish = publishQueue,
  batchStatementDeletionLockTimoutSec = BATCH_STATEMENT_DELETION_LOCK_TIMEOUT_SEC
}) => {
  if (boolean(get(process.env, 'ENABLE_STATEMENT_DELETION', true)) === false) {
    return;
  }

  const res =
    batchStatementDeletionLockTimoutSec ?
      await redisClient.set(BATCH_STATEMENT_DELETION_CACHE_KEY, 1, 'EX', batchStatementDeletionLockTimoutSec, 'NX') :
      'OK';

  const siteSettings = await SiteSettings.findOne({ _id: objectId(SITE_SETTINGS_ID) });
  if (res === 'OK') {
    const inDeletionWindow = inWindow(siteSettings);
    if (inDeletionWindow) {
      // push to queue
      const batchDeletes = await BatchDelete.find({
        done: false,
        processing: false
      });

      await each(batchDeletes, async (batchDelete) => {
        logger.info('Push to batch deletion queue');
        await publish({
          queueName: BATCH_STATEMENT_DELETION_QUEUE,
          payload: {
            batchDeleteId: batchDelete._id.toString(),
          }
        });
      });
    } else {
      logger.debug('Out of window - skip batch deletion');
    }
  } else {
    logger.debug('Scheduler locked - skip batch deletion');
  }

  // Schedule this to run again at the start of the next window
  const nextDateTime = nextRunAtDateTime(siteSettings);
  const now = moment();
  const msUntilNextRun = nextDateTime.diff(now);
  logger.debug(`Running again at ${nextDateTime} (${nextDateTime.fromNow()})`);

  setTimeout(runBatchDelete, msUntilNextRun, {});
  return msUntilNextRun;
};

export default runBatchDelete;
