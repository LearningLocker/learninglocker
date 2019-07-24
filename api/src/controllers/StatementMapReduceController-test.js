import Statement from 'lib/models/statement';
import { expect } from 'chai';
import TEST_ID from 'api/routes/tests/utils/testId';
import mongoose from 'mongoose';
import { statementsPerDayMapReduce, mapReduceStatementsPerDay } from './StatementMapReduceController';

const objectId = mongoose.Types.ObjectId;

describe.only('StatementMapReduceController', () => {
  describe('statementsPerDayMapReduce', () => {
    beforeEach(async () => {
      await Statement.deleteMany({});
      await mapReduceStatementsPerDay.deleteMany({});
    });

    it('should count one statement', async () => {
      // await Statement.create({
      //   statement: {},
      //   organisation: objectId(TEST_ID),
      //   timestamp: '2019-07-19T11:21:27.000Z'
      // });

      await Statement.create({
        statement: {},
        organisation: objectId(TEST_ID),
        hash: '123456',
        timestamp: '2019-07-19T11:21:28.000Z'
      });

      const result = await statementsPerDayMapReduce({
        organisation: TEST_ID,
        gt: '2019-07-18T11:21:27.000Z',
      });

      expect(result[0].model).to.equal('5');
      expect(result[0].count).to.equal(1);
    });

    it('should count two statements', async () => {
      await Statement.create({
        statement: {},
        organisation: objectId(TEST_ID),
        timestamp: '2019-07-19T11:21:27.000Z'
      });

      await Statement.create({
        statement: {},
        organisation: objectId(TEST_ID),
        hash: '123456',
        timestamp: '2019-07-19T11:21:28.000Z'
      });

      const result = await statementsPerDayMapReduce({
        organisation: TEST_ID,
        gt: '2019-07-18T11:21:27.000Z',
      });

      expect(result[0].model).to.equal('5');
      expect(result[0].count).to.equal(2);
    });

    it('should count statements correctly if gt date moves forward', async () => {
      await Statement.create({
        statement: {},
        organisation: objectId(TEST_ID),
        timestamp: '2019-07-19T11:21:27.000Z'
      });

      const result = await statementsPerDayMapReduce({
        organisation: TEST_ID,
        gt: '2019-07-18T11:21:27.000Z',
      });

      expect(result[0].model).to.equal('5');
      expect(result[0].count).to.equal(1);

      await Statement.create({
        statement: {},
        organisation: objectId(TEST_ID),
        hash: '123456',
        timestamp: '2019-07-21T11:21:28.000Z'
      });

      const result2 = await statementsPerDayMapReduce({
        organisation: TEST_ID,
        gt: '2019-07-20T11:21:27.000Z',
      });

      expect(result2[0].model).to.equal('0');
      expect(result2[0].count).to.equal(1);

      expect(result2[1].model).to.equal('5');
      expect(result2[1].count).to.equal(0);
    });
  });
});
