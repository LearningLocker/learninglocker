import StatementForwarding from 'lib/models/statementForwarding';
import Statement from 'lib/models/statement';
import Promise from 'bluebird';
import nock from 'nock';
import { expect } from 'chai';
// import ForwardingRequestError from
//   'worker/handlers/statement/statementForwarding/ForwardingRequestError';
import statementForwardingRequestHandler from '../statementForwardingRequestHandler';

const promiseRequestHandler = Promise.promisify(statementForwardingRequestHandler);

describe('Statement Forwarding Request', () => {
  afterEach(async () => {
    await Statement.remove({});
    await StatementForwarding.remove({});
  });

  it('Request returns 308', async () => {
    const statementId = '59438cabedcedb70146337ec';
    const statementForwardingId = '59438cabedcedb70146337eb';
    const organisationId = '561a679c0c5d017e4004715a';

    const statementForwarding = {
      _id: statementForwardingId,
      lrs_id: '560a679c0c5d017e4004714f',
      organisation: organisationId,
      active: true,
      configuration: {
        protocol: 'http',
        url: 'redirectto/',
        method: 'POST'
      }
    };

    const statement = {
      _id: statementId,
      organisation: organisationId,
      statement: {
        test: 'test'
      }
    };

    const request = nock('http://localhost:3101/')
      .post('/', {
        test: 'test'
      }).reply(200, {
        _id: '1',
        _rev: '1',
        success: true
      });

    const redirectRequest = nock('http://redirectto/')
      .post('/', {
        test: 'test'
      }).reply(308, undefined, {
        Location: 'http://localhost:3101/'
      });

    await Statement.create(statement);

    await promiseRequestHandler({ statementForwarding, statement });
    Promise.delay(1000);
    expect(redirectRequest.isDone()).to.equal(true);
    expect(request.isDone()).to.equal(true);

    const doneStatement = await Statement.findById(statementId);
    expect(doneStatement.pendingForwardingQueue.length).to.equal(0);
    expect(doneStatement.completedForwardingQueue.length).to.equal(1);
    expect(doneStatement.completedForwardingQueue[0].toString()).to.equal(statementForwardingId);
  }).timeout(10000);

  it('Request success', async () => {
    const statementId = '59438cabedcedb70146337ec';
    const statementForwardingId = '59438cabedcedb70146337eb';
    const organisationId = '561a679c0c5d017e4004715a';

    const statementForwarding = {
      _id: statementForwardingId,
      lrs_id: '560a679c0c5d017e4004714f',
      organisation: organisationId,
      active: true,
      configuration: {
        protocol: 'http',
        url: 'localhost:3101/',
        method: 'POST',
        headers: '{"testHeader1": "testHeaderValue1"}'
      }
    };

    const statement = {
      _id: statementId,
      organisation: organisationId,
      statement: {
        test: 'test'
      }
    };

    const request = nock('http://localhost:3101/', {
      reqheaders: {
        testHeader1: 'testHeaderValue1'
      }
    })
      .post('/', {
        test: 'test'
      })
      .reply(200, {
        _id: '1',
        _rev: '1',
        success: true
      });

    await Statement.create(statement);

    await promiseRequestHandler({ statementForwarding, statement });
    expect(request.isDone()).to.equal(true);

    const doneStatement = await Statement.findById(statementId);
    expect(doneStatement.pendingForwardingQueue.length).to.equal(0);
    expect(doneStatement.completedForwardingQueue.length).to.equal(1);
    expect(doneStatement.completedForwardingQueue[0].toString()).to.equal(statementForwardingId);
  }).timeout(10000);


  it('If a request fails, keep in pending', async () => {
    const statementId = '59438cabedcedb70146337ec';
    const statementForwardingId = '59438cabedcedb70146337eb';
    const organisationId = '561a679c0c5d017e4004715a';

    const statementForwarding = {
      _id: statementForwardingId,
      lrs_id: '560a679c0c5d017e4004714f',
      organisation: organisationId,
      active: true,
      configuration: {
        protocol: 'http',
        url: 'localhost:3101/',
        method: 'POST'
      }
    };

    const statement = {
      _id: statementId,
      organisation: organisationId,
      statement: {
        test: 'test'
      }
    };

    await Statement.create(statement);

    const request = nock('http://localhost:3101')
      .post('/', {
        test: 'test'
      })
      .reply(404, {
        _id: '1',
        _rev: '1',
        success: false
      });
    try {
      await promiseRequestHandler({ statementForwarding, statement });
    } catch (err) {
      expect(err).to.be.err; // eslint-disable-line no-unused-expressions
    }
    expect(request.isDone()).to.equal(true);

    const doneStatement = await Statement.findById(statementId);
    expect(doneStatement.pendingForwardingQueue[0].toString()).to
      .equal(statementForwardingId);
    expect(doneStatement.completedForwardingQueue.length).to
      .equal(0);
    expect(doneStatement.failedForwardingLog[0].statementForwarding_id.toString()).to
      .equal(statementForwardingId);
  }).timeout(5000);
});
