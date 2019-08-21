import logger from 'lib/logger';
import * as Queue from 'lib/services/queue';
import { AGGREGATION_PROCESSOR_QUEUE } from 'lib/constants/aggregationProcessor';
import aggregationProcessor from './aggregationProcessor';

const defaultHandleResponse = (err) => {
  if (err) logger.error(`ERROR SUBSCRIBING TO QUEUE ${AGGREGATION_PROCESSOR_QUEUE}`, err);
  return err;
};

export default ({
  onProcessed
}) => {
  Queue.subscribe({
    queueName: AGGREGATION_PROCESSOR_QUEUE,
    handler: aggregationProcessor,
    onProcessed
  }, defaultHandleResponse);
};
