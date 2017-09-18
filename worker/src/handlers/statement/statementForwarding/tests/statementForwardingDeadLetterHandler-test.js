import { expect } from 'chai';
import Statement from 'lib/models/statement';
import mongoose from 'mongoose';
import statementForwardingDeadLetterHandler from '../statementForwardingDeadLetterHandler';

const objectId = mongoose.Types.ObjectId;

describe('statementForwardingDeadLetterHandler', () => {
  it('Should update db', async () => {
    const statementId = '59438cabedcedb70146337ec';
    const statementForwardingId = '59438cabedcedb70146337eb';
    const organisationId = '561a679c0c5d017e4004715a';

    const statementForwarding = {
      _id: statementForwardingId,
      lrs_id: '560a679c0c5d017e4004714f',
      organisation: organisationId,
      active: true,
      configuration: {
        protocal: 'http',
        url: 'localhost:3101/',
        method: 'POST'
      }
    };

    const statement = {
      _id: statementId,
      organisation: organisationId,
      statement: {
        test: 'test'
      },
      pendingForwardingQueue: [objectId(statementForwardingId)]
    };

    await Statement.create(statement);

    await new Promise(resolve => statementForwardingDeadLetterHandler({
      statement,
      statementForwarding
    }, () => resolve()));

    await Statement.findById(statementId).then((statementModel) => {
      expect(statementModel.deadForwardingQueue[0].toString()).to
        .equal(statementForwardingId);
      expect(statementModel.pendingForwardingQueue.length).to
        .equal(0);
    });

    await new Promise(resolve =>
      Statement.remove({}, () => resolve())
    );
  });
});
