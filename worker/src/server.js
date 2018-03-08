import statementWorker from 'worker/handlers/statement';
import importPersonasWorker from 'worker/handlers/importPersonas';
import logger from 'lib/logger';

statementWorker({});
importPersonasWorker({});

logger.info('STARTED WORKER');

if (process.send) process.send('ready');
