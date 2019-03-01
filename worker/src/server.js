import statementWorker from 'worker/handlers/statement';
import importPersonasWorker from 'worker/handlers/importPersonas';
import logger from 'lib/logger';
import expirationNotification from 'worker/handlers/expirationNotification';
import orgUsageTracker from 'worker/handlers/orgUsageTracker';

statementWorker({});
expirationNotification();
importPersonasWorker({});
orgUsageTracker();

logger.info('STARTED WORKER');

if (process.send) process.send('ready');
