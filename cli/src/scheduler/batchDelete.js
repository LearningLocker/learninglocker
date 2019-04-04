import mongoose from 'mongoose';
import boolean from 'boolean';
import * as redis from 'lib/connections/redis';
import logger from 'lib/logger';
import { get } from 'lodash';
import { each } from 'bluebird';
import SiteSettings from 'lib/models/siteSettings';
import BatchDelete, { asTime } from 'lib/models/batchDelete';
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
  timeout = setTimeout,
  publish = publishQueue,
  batchStatementDeletionLockTimoutSec = BATCH_STATEMENT_DELETION_LOCK_TIMEOUT_SEC
}) => {
  if (boolean(get(process.env, 'ENABLE_BATCH_STATEMENT_DELETION', false)) === false) {
    return;
  }

  const res =
    batchStatementDeletionLockTimoutSec ?
      await redisClient.set(BATCH_STATEMENT_DELETION_CACHE_KEY, 1, 'EX', batchStatementDeletionLockTimoutSec, 'NX') :
      'OK';
  const siteSettings = await SiteSettings.findOne({ _id: objectId(SITE_SETTINGS_ID) });

  if (res === 'OK') {
    // push to queue
    const batchDeletes = await BatchDelete.find({
      done: false,
      processing: false
    });

    await each(batchDeletes, async (batchDelete) => {
      await publish({
        queueName: BATCH_STATEMENT_DELETION_QUEUE,
        payload: {
          batchDeleteId: batchDelete._id.toString(),
        }
      });
    });
  } else {
    logger.info('skip batch deletion');
  }

  // push to the queue
  const nextStartTime = get(siteSettings, 'batchDeleteWindowStartTime');
  let nextRun = 1000 * 60 * 15;
  if (nextStartTime) {
    nextRun = -asTime(moment()).diff(
      asTime(moment(nextStartTime))
    );
    if (nextRun < 0) {
      nextRun = moment(nextRun).add(1, 'days').valueOf();
    }
  }
  timeout(runBatchDelete, nextRun);
};

export default runBatchDelete;
