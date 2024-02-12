import StatementForwarding from 'lib/models/statementForwarding';
import Statement from 'lib/models/statement';
import async from 'async';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import { expect } from 'chai';
import { STATEMENT_FORWARDING_REQUEST_QUEUE } from 'lib/constants/statements';
import statementWorker from 'worker/handlers/statement';
import { unsubscribeAll } from 'lib/services/queue';
import statementForwardingHandler from '../statementForwardingHandler';
import { purgeQueues } from './utils';

describe('Statement Forwarding handler', () => {
  it('Should take a statement and put it in a queue for each statmentForwarder', () => {
    const statementId = '561a679c0c5d017e4004714f';
    const organisationId = '561a679c0c5d017e4004715a';

    const mockQueue = resolve => ({
      publish: (data) => {
        expect(data.queueName).to.equal(STATEMENT_FORWARDING_REQUEST_QUEUE);
        expect(data.payload.status).to.equal(STATEMENT_FORWARDING_REQUEST_QUEUE);

        expect(data.payload.statement._id.toString()).to.equal(statementId);
        expect(data.payload.statementForwarding._id.toString()).to.equal('59438cabedcedb70146337eb');
        resolve();
      }
    });

    const cleanUp = () => new Promise(reslove =>
      async.forEach(
        [StatementForwarding, Statement],
        (model, doneDeleting) => {
          model.deleteMany({}, doneDeleting);
        },
        reslove
      )
    );

    // Setup db with a statement
    return new Promise((resolve, reject) => {
      async.parallel({
        statementForwarding: insertDone => StatementForwarding.create({
          _id: '59438cabedcedb70146337eb',
          lrs_id: '560a679c0c5d017e4004714f',
          organisation: organisationId,
          active: true,
          configuration: {
            url: 'localhost:3101/',
            method: 'POST'
          }
        }, insertDone),
        statement: insertDone => Statement.create({
          active: true,
          _id: statementId,
          lrs_id: '560a679c0c5d017e4004714f',
          organisation: organisationId,
          statement: {
            test: 'test'
          },
          processingQueues: [],
          completedQueues: []
        }, insertDone)
      }, (err) => {
        if (err) reject(err);
        resolve();
      });
    }).then((params) => { // Do the stuff
      const promise = new Promise(resolve =>
        statementForwardingHandler({ statementId }, () => {
          resolve(params);
        }, {
          queue: mockQueue(resolve)
        })
      );
      return promise;
    })
      .then(() => cleanUp(), () => cleanUp())
  }).timeout(5000);

  it('Statement end to end', async () => {
    const statementId = '561a679c0c5d017e4004714f';
    const organisationId = '561a679c0c5d017e4004715a';

    await new Promise((resolve) => {
      async.parallel({
        statementForwarding: insertDone => StatementForwarding.create({
          _id: '59438cabedcedb70146337eb',
          lrs_id: '560a679c0c5d017e4004714f',
          organisation: organisationId,
          active: true,
          configuration: {
            protocol: 'http',
            url: 'localhost:3101/',
            method: 'POST',
            authType: 'basic auth',
            basicUsername: 'theBasicUsername',
            basicPassword: 'theBasicPassword'
          }
        }, insertDone),
        statement: insertDone => Statement.create({
          active: true,
          _id: statementId,
          organisation: organisationId,
          lrs_id: '560a679c0c5d017e4004714f',
          statement: {
            test: 'test'
          },
          processingQueues: [],
          completedQueues: [ // We're only interested in STATEMENT_FORWARDING_REQUEST_QUEUE
            'STATEMENT_PERSON_QUEUE',
            'STATEMENT_QUERYBUILDERCACHE_QUEUE'
          ]
        }, insertDone)
      }, resolve);
    });

    await purgeQueues();

    const mock = new AxiosMockAdapter(axios);
    mock.onPost('http://localhost:3101', { test: 'test' }, {
      authorization: 'Basic dGhlQmFzaWNVc2VybmFtZTp0aGVCYXNpY1Bhc3N3b3Jk'
    }).reply(200, {
      _id: '1',
      _rev: '1',
      success: true
    });

    const statementWorkerDonePromise = new Promise((resolve) => {
      const statementHandlerProcessed = (message) => {
        expect(JSON.parse(message.Body).statementId).to.equal(statementId);
        resolve();
      };

      statementWorker({
        statementHandlerProcessed
      });
    });

    await new Promise(resolve =>
      statementForwardingHandler({ statementId }, () => {
        resolve();
      })
    );

    /*
    We want to wait for message to be propagated back through the
    statement queue before we test request has been called
    and before we clean up the db. Otherwise, processing
    of the queues will fail and leave messages in it.
    */
    await statementWorkerDonePromise;

    expect(mock.history.post.length).to.equal(1);

    await unsubscribeAll();

    await Promise.all([
      StatementForwarding.deleteMany({}),
      Statement.deleteMany({})
    ]);
  })
    .timeout(10000);
});
