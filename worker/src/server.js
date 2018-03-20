import statementWorker from 'worker/handlers/statement';
import importPersonasWorker from 'worker/handlers/importPersonas';
import uploadWorker from 'worker/handlers/upload';
import logger from 'lib/logger';
import expirationNotification from 'worker/handlers/expirationNotification';

statementWorker({});
uploadWorker();
expirationNotification();
importPersonasWorker({});

logger.info('STARTED WORKER');

if (process.send) process.send('ready');
