import {
  STATEMENT_FORWARDING_REQUEST_QUEUE,
  STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE,
  STATEMENT_FORWARDING_DEADLETTER_QUEUE
} from 'lib/constants/statements';
import ORG_USAGE_TRACKER_QUEUE from 'lib/constants/orgUsageTracker';
import { BATCH_STATEMENT_DELETION_QUEUE } from 'lib/constants/batchDelete';

const MAX_RETRY_DELAY = 900; // 900 (15 minutes, max allowed DelaySeconds: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SQS.html)

export const getPrefixedQueueName = queueName => `${process.env.QUEUE_NAMESPACE}_${queueName}`;

const queueConfig = (queueName) => {
  switch (queueName) {
    case STATEMENT_FORWARDING_REQUEST_QUEUE:
      return {
        deadLetter: getPrefixedQueueName(STATEMENT_FORWARDING_DEADLETTER_QUEUE)
      };
    case STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE:
      return {
        deadLetter: getPrefixedQueueName(STATEMENT_FORWARDING_DEADLETTER_QUEUE),
        retryDelay: MAX_RETRY_DELAY
      };
    case BATCH_STATEMENT_DELETION_QUEUE:
      return {
        visibilityTimeout: 60 * 60 // 1 hour
      };
    case ORG_USAGE_TRACKER_QUEUE:
      return {
        visibilityTimeout: 60 * 60 // 1 hour
      };
    default:
      return {};
  }
};

export default queueConfig;
