import { expect } from 'chai';
import ORG_USAGE_TRACKER_QUEUE from 'lib/constants/orgUsageTracker';
import orgUsageTracker from './orgUsageTracker';

describe('orgUsageTracker', () => {
  it('should publish to ORG_USAGE_TRACKER_QUEUE', async () => {
    let publishCalled = false;
    await orgUsageTracker({
      publish: ({
        queueName,
        payload
      }) => {
        publishCalled = true;
        expect(queueName).to.equal(ORG_USAGE_TRACKER_QUEUE);
        expect(payload).to.deep.equal({});
      },
      dontExit: true
    });
    expect(publishCalled).to.equal(true);
  });
});
