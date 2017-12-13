import statementWorker from 'worker/handlers/statement';
import logger from 'lib/logger';

statementWorker({});

logger.info('STARTED WORKER');

if (process.send) process.send('ready');
