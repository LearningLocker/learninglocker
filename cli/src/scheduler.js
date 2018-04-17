import expirationNotificationEmails from 'cli/commands/expirationNotificationEmails';
import logger from 'lib/logger';

const timeout = 15 * 60 * 1000;

const run = async () => {
  logger.info('processing expiration');
  const startTime = Date.now();

  await expirationNotificationEmails({
    dontExit: true
  });

  setTimeout(run, (startTime - Date.now()) + timeout);
};

run();
