import logger from 'lib/logger';
import { RECOMENDATION_RESET_QUEUE } from 'lib/constants/recommendation';
import * as Queue from 'lib/services/queue';
import recommendationReset from './recommendationReset';

const defaultHandleResponse = (err) => {
  if (err) logger.error(`ERROR SUBSCRIBING TO QUEUE ${RECOMENDATION_RESET_QUEUE}`, err);
  return err;
}

export default () => {
  Queue.subscribe({
    queueName: RECOMENDATION_RESET_QUEUE,
    handler: recommendationReset
  }, defaultHandleResponse);
};