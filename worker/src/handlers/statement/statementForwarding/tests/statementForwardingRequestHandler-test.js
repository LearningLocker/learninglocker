import StatementForwarding from 'lib/models/statementForwarding';
import Statement from 'lib/models/statement';
import nock from 'nock';
import async from 'async';
import { expect } from 'chai';
import statementForwardingRequestHandler from '../statementForwardingRequestHandler';

describe('Statement Forwarding Request', () => {
  it('Request success', (done) => {
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
      }
    };

    Statement.create(statement)
    .then(() => {
      const request = nock('http://localhost:3101/')
        .post('/', {
          test: 'test'
        })
        .reply(200, {
          _id: '1',
          _rev: '1',
          success: true
        });
      return { request };
    }).then((params) => {
      const promise = new Promise(resolve =>
        statementForwardingRequestHandler({
          statementForwarding,
          statement
        }, () => {
          resolve(params);
        })
      );

      return promise;
    })
    .then(({ request }) => {
      expect(request.isDone()).to.equal(true);
    })
    .then(() =>
      new Promise((resolve) => {
        Statement.findById(statementId).then((statementModel) => {
          expect(statementModel.pendingForwardingQueue.length).to
            .equal(0);
          expect(statementModel.completedForwardingQueue[0].toString()).to
            .equal(statementForwardingId);
          resolve();
        });
      })
    )
    .then(() => new Promise(reslove =>
      async.forEach(
        [StatementForwarding, Statement],
        (model, doneDeleting) => {
          model.remove({}, doneDeleting);
        },
        reslove
      )
    ), () => new Promise(reslove =>
      async.forEach(
        [StatementForwarding, Statement],
        (model, doneDeleting) => {
          model.remove({}, doneDeleting);
        },
        reslove
      )
    ))
    .then(() => {
      done();
    });
  }).timeout(10000);


  it('If a request fails, keep in pending', (done) => {
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

    Statement.create(statement)
    .then(() => {
      const request = nock('http://localhost:3101')
        .post('/', {
          test: 'test'
        })
        .reply(404, {
          _id: '1',
          _rev: '1',
          success: false
        });
      return { request };
    }).then((params) => {
      const promise = new Promise(resolve =>
        statementForwardingRequestHandler({
          statementForwarding,
          statement
        }, () => {
          resolve(params);
        })
      );

      return promise;
    })
    .then(({ request }) => {
      expect(request.isDone()).to.equal(true);
    })
    .then(() =>
      new Promise((resolve) => {
        Statement.findById(statementId).then((statementModel) => {
          expect(statementModel.pendingForwardingQueue[0].toString()).to
            .equal(statementForwardingId);
          expect(statementModel.completedForwardingQueue.length).to
            .equal(0);
          expect(statementModel.failedForwardingLog[0].statementForwarding_id.toString()).to
            .equal(statementForwardingId);
          resolve();
        });
      })
    )
    .then(() => new Promise(reslove =>
      async.forEach(
        [StatementForwarding, Statement],
        (model, doneDeleting) => {
          model.remove({}, doneDeleting);
        },
        reslove
      )
    ))
    .then(() => {
      done();
    });
  }).timeout(5000);
});
