import { expect } from 'chai';
import { get, omit } from 'lodash';
import AggregationProcessor from 'lib/models/aggregationProcessor';
import { AGGREGATION_PROCESSOR_QUEUE } from 'lib/constants/aggregationProcessor';
import Statement from 'lib/models/statement';
import sha1 from 'sha1';
import moment from 'moment';
import mongoose from 'mongoose';
import TEST_ID from 'api/routes/tests/utils/testId';
import aggregationProcessor, { combine } from './aggregationProcessor';

const objectId = mongoose.Types.ObjectId;

describe('aggregationProcessor', () => {
  describe('unionFirst', () => {
    it('combine', () => {
      const addInput = [{
        _id: 1,
        model: 1,
        count: 1
      }, {
        _id: 2,
        model: 2,
        count: 1
      }];

      const subtractInput = [{
        _id: 2,
        model: 2,
        count: 1
      }, {
        _id: 3,
        model: 3,
        count: 1
      }];

      const res = combine(addInput, subtractInput, result => result.model, (model, a, b) => {
        const countA = get(a, 'count', 0);
        const countB = get(b, 'count', 0);
        const count = countA - countB;
        const extraA = omit(a, 'count');
        const extraB = omit(b, 'count');
        return { ...extraA, ...extraB, count };
      });

      expect(res[0]._id).to.equal(1);
      expect(res[0].model).to.equal(1);
      expect(res[0].count).to.equal(1);
      expect(res[1]._id).to.equal(2);
      expect(res[1].model).to.equal(2);
      expect(res[1].count).to.equal(0);
      expect(res[2]._id).to.equal(3);
      expect(res[2].model).to.equal(3);
      expect(res[2].count).to.equal(-1);
    });
  });

  beforeEach(async () => {
    await AggregationProcessor.deleteMany({});
    await Statement.deleteMany({});
  });

  const pipeline = [
    {
      $project: {
        group: {
          $dayOfWeek: {
            date: '$timestamp',
            timezone: 'UTC'
          }
        },
        model: {
          $dayOfWeek: {
            date: '$timestamp',
            timezone: 'UTC'
          }
        }
      }
    },
    {
      $group: {
        _id: '$group',
        count: {
          $sum: 1
        },
        group: {
          $first: '$group'
        },
        model: {
          $first: '$model'
        }
      }
    },
    {
      $sort: {
        count: -1
      }
    },
    {
      $limit: 10000
    },
    {
      $project: {
        _id: 1,
        count: 1,
        model: 1
      }
    }
  ];
  const pipelineString = JSON.stringify(pipeline);
  const pipelineHash = sha1(pipelineString);

  it('Should count one statement', async () => {
    // insert a statement
    await Statement.create({
      statement: {},
      organisation: objectId(TEST_ID),
      hash: '123456',
      timestamp: moment().toDate()
    });

    const aggregationProcessorModel = await AggregationProcessor.create({
      pipelineString,
      pipelineHash,
      windowSize: 1,
      gtDate: moment().subtract(1, 'days').toDate()
    });

    let done = false;
    const doneFn = () => {
      done = true;
    };

    const result = await aggregationProcessor({
      aggregationProcessorId: aggregationProcessorModel._id
    }, doneFn);

    expect(done).to.equal(true);
    expect(result[0].count).to.equal(1);
    expect(result[0].model).to.equal((moment().toDate().getDay() + 1));
  });

  it('Should add to aggrigation for new statements', async () => {
    await Statement.create({
      statement: {},
      organisation: objectId(TEST_ID),
      hash: '123456',
      timestamp: moment().toDate()
    });

    const { _id: aggregationProcessorId } = await AggregationProcessor.create({
      pipelineString,
      pipelineHash,
      windowSize: 1,
      gtDate: moment().subtract(1, 'days').toDate()
    });

    let doneCount = 0;
    const doneFn = () => {
      doneCount += 1;
    };

    await aggregationProcessor({
      aggregationProcessorId
    }, doneFn);

    const newStatementTimestamp = moment().toDate();
    await Statement.create({
      statement: {},
      organisation: objectId(TEST_ID),
      hash: '123457',
      timestamp: newStatementTimestamp
    });

    const result = await aggregationProcessor({
      aggregationProcessorId
    }, doneFn);

    expect(doneCount).to.equal(2);
    expect(result[0].count).to.equal(2);
    expect(result[0].model).to.equal((moment().toDate().getDay() + 1));
  });

  it('should subtract results outside the window', async () => {
    await Statement.create({
      statement: {},
      organisation: objectId(TEST_ID),
      hash: '123456',
      timestamp: moment().toDate()
    });

    const { _id: aggregationProcessorId } = await AggregationProcessor.create({
      pipelineString,
      pipelineHash,
      windowSize: 1,
      gtDate: moment().subtract(1, 'days').toDate()
    });

    let doneCount = 0;
    const doneFn = () => {
      doneCount += 1;
    };

    await aggregationProcessor({
      aggregationProcessorId
    }, doneFn);

    let pulbishQueueCalls = 0;
    const mockPublishQueue = ({
      queueName,
      payload
    }) => {
      pulbishQueueCalls += 1;
      expect(queueName).to.equal(AGGREGATION_PROCESSOR_QUEUE);
      expect(payload.aggregationProcessorId).to.equal(aggregationProcessorId);
    };

    // To test

    const result = await aggregationProcessor({
      aggregationProcessorId,
      publishQueue: mockPublishQueue,
      now: moment().add(1, 'day')
    }, doneFn);

    expect(doneCount).to.equal(2);

    expect(result[0].count).to.equal(0);
    expect(result[0].model).to.equal((moment().toDate().getDay() + 1));
    expect(pulbishQueueCalls).to.equal(0);
  });
});
