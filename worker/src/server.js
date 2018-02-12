import statementWorker from 'worker/handlers/statement';
import uploadWorker from 'worker/handlers/upload';
import logger from 'lib/logger';
import expirationNotification from 'worker/handlers/expirationNotification';

statementWorker({});
uploadWorker();
expirationNotification();

logger.info('STARTED WORKER');

if (process.send) process.send('ready');
