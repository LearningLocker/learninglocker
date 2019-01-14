import expirationNotificationEmails from 'cli/commands/expirationNotificationEmails';
import orgUsageTracker from 'cli/commands/orgUsageTracker';
import logger from 'lib/logger';

/**
 * Run expirationNotificationEmails every 15 minutes
 */
const expirationTimeout = 15 * 60 * 1000;

const runExpiration = async () => {
  logger.info('processing expiration');
  const startTime = Date.now();

  await expirationNotificationEmails({
    dontExit: true
  });

  setTimeout(runExpiration, expirationTimeout - (Date.now() - startTime));
};

runExpiration();


/**
 * Run orgUsageTracker at 3 am everyday
 */
const orgUsageTimeout = 24 * 60 * 60 * 1000;

const runOrgUsage = async () => {
  logger.info('processing org usage');
  const startTime = Date.now();

  await orgUsageTracker({
    dontExit: true
  });

  setTimeout(runOrgUsage, orgUsageTimeout - (Date.now() - startTime));
};

const today3am = new Date();
today3am.setHours(3, 0, 0, 0);

const tomorrow3am = new Date();
tomorrow3am.setHours(3, 0, 0, 0);
tomorrow3am.setDate(tomorrow3am.getDate() + 1);

const firstRunDatetime = Date.now() < today3am ? today3am : tomorrow3am;

logger.info(`The first org usage tracking is at ${firstRunDatetime}`);
setTimeout(runOrgUsage, firstRunDatetime - Date.now());
