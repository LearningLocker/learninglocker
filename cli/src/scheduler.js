import expirationNotificationEmails from 'worker/commands/expirationNotificationEmails';
import logger from 'lib/logger';

const timeout = 15 * 60 * 100;

const run = async () => {
  logger.info('processing expiration');
  const startTime = Date.now();

  await expirationNotificationEmails({
    dontExit: true
  });

  setTimeout(run, (startTime - Date.now()) + timeout);
};

run();
