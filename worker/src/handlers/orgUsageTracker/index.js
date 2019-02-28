import logger from 'lib/logger';
import ORG_USAGE_TRACKER_QUEUE from 'lib/constants/orgUsageTracker';
import * as Queue from 'lib/services/queue';
import orgUsageTracker from './orgUsageTracker';

const defaultHandleResponse = (err) => {
  if (err) logger.error(`ERROR SUBSCRIBING TO QUEUE ${ORG_USAGE_TRACKER_QUEUE}`, err);
  return err;
};

export default () => {
  Queue.subscribe({
    queueName: ORG_USAGE_TRACKER_QUEUE,
    handler: orgUsageTracker
  }, defaultHandleResponse);
};
