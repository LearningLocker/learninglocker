import statementWorker from 'worker/handlers/statement';
import uploadWorker from 'worker/handlers/upload';
import logger from 'lib/logger';

statementWorker({});
uploadWorker();

logger.info('STARTED WORKER');

if (process.send) process.send('ready');
