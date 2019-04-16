import statementWorker from 'worker/handlers/statement';
import importPersonasWorker from 'worker/handlers/importPersonas';
import logger from 'lib/logger';
import expirationNotification from 'worker/handlers/expirationNotification';
import orgUsageTracker from 'worker/handlers/orgUsageTracker';
import recommendation from 'worker/handlers/recommendation';

statementWorker({});
expirationNotification();
importPersonasWorker({});
orgUsageTracker();
recommendation();

logger.info('STARTED WORKER');

if (process.send) process.send('ready');
