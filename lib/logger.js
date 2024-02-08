import moment from 'moment';
import boolean from 'boolean';
import winston from 'winston';

const timeFormatFn = () => moment().format('YYYY-MM-DD HH:mm:ss:SSS');

const colorize = boolean(process.env.COLOR_LOGS);

winston.cli();
const logger = new winston.Logger({
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      colorize,
      timestamp: timeFormatFn,
      prettyPrint: true,
      humanReadableUnhandledException: true,
      level: process.env.LOG_MIN_LEVEL,
      stderrLevels: ['error'] // only log error to stdErr
    }),
  ]
});

export default logger;
