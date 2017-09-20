import os from 'os';
import moment from 'moment';
import boolean from 'boolean';
import winston from 'winston';
import CloudWatchTransport from 'winston-aws-cloudwatch';
import defaultTo from 'lodash/defaultTo';

const timeFormatFn = () => moment().format('YYYY-MM-DD HH:mm:ss:SSS');

const colorize = boolean(process.env.COLOR_LOGS);
const enableCloudwatch = boolean(defaultTo(process.env.WINSTON_CLOUDWATCH_ENABLED, false));

const createCloudwatchTransport = () =>
  new CloudWatchTransport({
    level: defaultTo(process.env.LOG_MIN_LEVEL, 'info'),
    logGroupName: defaultTo(process.env.WINSTON_CLOUDWATCH_LOG_GROUP_NAME, 'llv2'),
    logStreamName: defaultTo(process.env.WINSTON_CLOUDWATCH_LOG_STREAM_NAME, os.hostname()),
    createLogGroup: true,
    createLogStream: true,
    awsConfig: {
      accessKeyId: process.env.WINSTON_CLOUDWATCH_ACCESS_KEY_ID,
      secretAccessKey: process.env.WINSTON_CLOUDWATCH_SECRET_ACCESS_KEY,
      region: process.env.WINSTON_CLOUDWATCH_REGION
    }
  });

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
    ...(enableCloudwatch === false ? [] : [createCloudwatchTransport()])
  ]
});

export default logger;
