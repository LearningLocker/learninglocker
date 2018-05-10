import logger from 'lib/logger';
import { EMAIL_EXPIRATION_NOTIFICATION_QUEUE } from 'lib/constants/expirationNotifications';
import * as Queue from 'lib/services/queue';
import expirationNotification from './expirationNotification';

const defaultHandleResponse = (err) => {
  if (err) logger.error(`ERROR SUBSCRIBING TO QUEUE ${EMAIL_EXPIRATION_NOTIFICATION_QUEUE}`, err);
  return err;
};

export default () => {
  Queue.subscribe({
    queueName: EMAIL_EXPIRATION_NOTIFICATION_QUEUE,
    handler: expirationNotification
  }, defaultHandleResponse);
};
