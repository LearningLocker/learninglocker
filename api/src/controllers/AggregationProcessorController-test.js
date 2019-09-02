import { expect } from 'chai';
import sha1 from 'sha1';
import TEST_ID from 'api/routes/tests/utils/testId';
import AggregationProcessor from 'lib/models/aggregationProcessor';
import { findOrCreateAggregationProcessor } from './AggregationProcessorController';


describe('AggregationProcessorController', () => {
  beforeEach(async () => {
    await AggregationProcessor.deleteMany({});
  });

  it('Should create an AggregationProcessor model', async () => {
    const pipeline = [{ $match: true }];
    const pipelineString = JSON.stringify(pipeline);
    const pipelineHash = sha1(pipelineString);

    const model = await findOrCreateAggregationProcessor({
      pipelineString,
      pipelineHash,
      organisation: TEST_ID,
      windowSize: 7
    });

    expect(model.organisation.toString()).to.equal(TEST_ID);
    expect(model.windowSize).to.equal(7);
    expect(model.blockSizeSeconds).to.equal(604800);
  });
});
