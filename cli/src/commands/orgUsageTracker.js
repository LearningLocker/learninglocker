import { publish as publishToQueue } from 'lib/services/queue';
import ORG_USAGE_TRACKER_QUEUE from 'lib/constants/orgUsageTracker';

export default async function ({
  publish = publishToQueue, // for testing
  dontExit = false
}) {
  await publish({
    queueName: ORG_USAGE_TRACKER_QUEUE,
    payload: {}
  });

  if (!dontExit) {
    process.exit();
  }
}
