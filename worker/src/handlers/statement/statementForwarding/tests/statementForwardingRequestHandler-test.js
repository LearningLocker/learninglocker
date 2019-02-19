import createSha from '@learninglocker/xapi-statements/dist/tests/utils/createSha';
import stringToStream from 'string-to-stream';
import StatementForwarding from 'lib/models/statementForwarding';
import Statement from 'lib/models/statement';
import Promise from 'bluebird';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import { expect } from 'chai';
// import ForwardingRequestError from
//   'worker/handlers/statement/statementForwarding/ForwardingRequestError';
import statementForwardingRequestHandler from '../statementForwardingRequestHandler';
import getStatementsRepo from '../getStatementsRepo';

const promiseRequestHandler = Promise.promisify(statementForwardingRequestHandler);

describe('Statement Forwarding Request', () => {
  afterEach(async () => {
    await Statement.deleteMany({});
    await StatementForwarding.deleteMany({});
  });

  it('Request handles redirect', async () => {
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

    const mock = new AxiosMockAdapter(axios);
    mock.onPost('http://localhost:3101/', { test: 'test' }).reply(200, {
      _id: '1',
      _rev: '1',
      success: true
    });

    mock.onPost('http://redirectto/', { test: 'test' }).reply(config => axios.post('http://localhost:3101/', { test: 'test' }, config));

    await Statement.create(statement);

    await promiseRequestHandler({ statementForwarding, statement });
    Promise.delay(1000);
    expect(mock.history.post.length).to.equal(2);

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

    const mock = new AxiosMockAdapter(axios);
    mock.onPost('http://localhost:3101/', { test: 'test' }).reply(200, {
      _id: '1',
      _rev: '1',
      success: true
    });

    await Statement.create(statement);

    await promiseRequestHandler({ statementForwarding, statement });
    expect(mock.history.post.length).to.equal(1);

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

    const mock = new AxiosMockAdapter(axios);
    mock.onPost('http://localhost:3101', { test: 'test' }).reply(404, {
      _id: '1',
      _rev: '1',
      success: false
    });
    try {
      await promiseRequestHandler({ statementForwarding, statement });
    } catch (err) {
      expect(err).to.be.err; // eslint-disable-line no-unused-expressions
    }
    expect(mock.history.post.length).to.equal(1);

    const doneStatement = await Statement.findById(statementId);
    expect(doneStatement.pendingForwardingQueue[0].toString()).to
      .equal(statementForwardingId);
    expect(doneStatement.completedForwardingQueue.length).to
      .equal(0);
    expect(doneStatement.failedForwardingLog[0].statementForwarding_id.toString()).to
      .equal(statementForwardingId);
    expect(doneStatement.failedForwardingLog[0].errorInfo.responseStatus).to
      .equal(404);
  }).timeout(5000);


  it('If a request timesout, keep in pending', async () => {
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

    const mock = new AxiosMockAdapter(axios);
    mock.onPost('http://localhost:3101/').timeout();
    try {
      await promiseRequestHandler({ statementForwarding, statement });
      expect(true, 'Should not reach this line').to.equal(false);
    } catch (err) {
      expect(err).to.be.err; // eslint-disable-line no-unused-expressions
    }
    expect(mock.history.post.length).to.equal(1);

    const doneStatement = await Statement.findById(statementId);
    expect(doneStatement.pendingForwardingQueue[0].toString()).to
      .equal(statementForwardingId);
    expect(doneStatement.completedForwardingQueue.length).to
      .equal(0);
    expect(doneStatement.failedForwardingLog[0].statementForwarding_id.toString()).to
      .equal(statementForwardingId);
    expect(doneStatement.failedForwardingLog[0].errorInfo.responseStatus).to.equal(null);
  }).timeout(10000);

  it('Request with attachments success', async () => {
    const statementId = '59438cabedcedb70146337ec';
    const statementForwardingId = '59438cabedcedb70146337eb';
    const organisationId = '561a679c0c5d017e4004715a';
    const lrsId = '560a679c0c5d017e4004714f';
    const attachmentContent = 'test_content';
    const attachmentHash = createSha(attachmentContent);

    const statementForwarding = {
      _id: statementForwardingId,
      lrs_id: lrsId,
      organisation: organisationId,
      active: true,
      configuration: {
        protocol: 'http',
        url: 'localhost:3101/',
        method: 'POST',
        headers: '{"testHeader1": "testHeaderValue1"}'
      },
      sendAttachments: true
    };

    const statement = {
      _id: statementId,
      organisation: organisationId,
      lrs_id: lrsId,
      statement: {
        object: {
          objectType: 'http://www.example.com'
        },
        attachments: [{
          usageType: 'http://www.example.com',
          display: {},
          contentType: 'text/plain',
          length: attachmentContent.length,
          sha2: attachmentHash,
        }]
      }
    };

    const mock = new AxiosMockAdapter(axios);
    mock.onPost('http://localhost:3101/').reply(200, {
      _id: '1',
      _rev: '1',
      success: false
    });

    await Statement.create(statement);
    const statementsRepo = getStatementsRepo();
    await statementsRepo.createAttachments({
      models: [{
        stream: stringToStream(attachmentContent),
        hash: attachmentHash,
        contentLength: attachmentContent.length,
        contentType: 'text/plain',
      }],
      lrs_id: lrsId,
    });

    await promiseRequestHandler({ statementForwarding, statement });
    expect(mock.history.post.length).to.equal(1);

    const doneStatement = await Statement.findById(statementId);
    expect(doneStatement.pendingForwardingQueue.length).to.equal(0);
    expect(doneStatement.completedForwardingQueue.length).to.equal(1);
    expect(doneStatement.completedForwardingQueue[0].toString()).to.equal(statementForwardingId);
  }).timeout(10000);
});
