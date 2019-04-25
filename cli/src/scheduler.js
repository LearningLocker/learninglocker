import expirationNotificationEmails from 'cli/commands/expirationNotificationEmails';
import orgUsageTracker from 'cli/commands/orgUsageTracker';
import * as redis from 'lib/connections/redis';
import logger from 'lib/logger';
import cachePrefix from 'lib/helpers/cachePrefix';
import runBatchDelete from './scheduler/batchDelete';

const redisClient = redis.createClient();

/**
 * Run expirationNotificationEmails every 15 minutes
 */
const EXPIRATION_TIMEOUT_MSEC = 15 * 60 * 1000;
const EXPIRATION_LOCK_DURATION_SEC = 30;
const EXPIRATION_CACHE_KEY = cachePrefix('EXPIRATION_SCHEDULER:RUNNING');

const runExpiration = async () => {
  const startTime = Date.now();
  const res = await redisClient.set(EXPIRATION_CACHE_KEY, 1, 'EX', EXPIRATION_LOCK_DURATION_SEC, 'NX');

  if (res === 'OK') {
    logger.info('processing expiration');
    await expirationNotificationEmails({ dontExit: true });
  } else {
    logger.debug('skip expiration');
  }

  setTimeout(runExpiration, EXPIRATION_TIMEOUT_MSEC - (Date.now() - startTime));
};

runExpiration();


/**
 * Run orgUsageTracker at 3 am everyday
 */
const ORG_USAGE_TIMEOUT_MSEC = 24 * 60 * 60 * 1000;
const ORG_USAGE_LOCK_DURATION_SEC = 60 * 60;
const ORG_USAGE_CACHE_KEY = cachePrefix('ORG_USAGE_SCHEDULER:RUNNING');

const runOrgUsage = async () => {
  const startTime = Date.now();
  const res = await redisClient.set(ORG_USAGE_CACHE_KEY, 1, 'EX', ORG_USAGE_LOCK_DURATION_SEC, 'NX');

  if (res === 'OK') {
    logger.info('processing org usage');
    await orgUsageTracker({ dontExit: true });
  } else {
    logger.debug('skip org usage');
  }

  setTimeout(runOrgUsage, ORG_USAGE_TIMEOUT_MSEC - (Date.now() - startTime));
};

const today3am = new Date();
today3am.setHours(3, 0, 0, 0);

const tomorrow3am = new Date();
tomorrow3am.setHours(3, 0, 0, 0);
tomorrow3am.setDate(tomorrow3am.getDate() + 1);

const firstRunDatetime = Date.now() < today3am ? today3am : tomorrow3am;

logger.info(`The first org usage tracking is at ${firstRunDatetime}`);
setTimeout(runOrgUsage, firstRunDatetime - Date.now());

/**
 * Run delete jobs
 */
runBatchDelete({});
