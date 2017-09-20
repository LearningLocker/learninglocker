import Statement from 'lib/models/statement';
import Lrs from 'lib/models/lrs';
import QueryBuilderCache from 'lib/models/querybuildercache';
import async from 'async';

export default class queryBuilderCacheDBHelper {
  prepare = (done) => {
    async.parallel({
      lrs: insertDone => Lrs.create({
        _id: '560a679c0c5d017e4004714f',
        title: 'TEST',
        description: 'TEST LRS',
        organisation: '561a679c0c5d017e4004714f',
      }, insertDone),
      actorStatement: insertDone => Statement.create({
        active: true,
        _id: '561a679c0c5d017e4004714f',
        lrs_id: '560a679c0c5d017e4004714f',
        statement: {
          version: '1.0.0',
          actor: {
            objectType: 'Agent',
            mbox: 'mailto:ex@mple.com',
            name: 'Example'
          },
          verb: {
            id: 'http://www.example.com'
          },
          object: {
            objectType: 'Activity',
            id: 'http://www.example.com'
          },
          authority: {
            objectType: 'Agent',
            mbox: 'mailto:hello@learninglocker.net',
            name: 'New Client'
          },
          stored: '2016-04-13T12:34:58.392000+00:00',
          timestamp: '2016-04-13T12:34:58.392000+00:00',
          id: '5e56d6e9-e585-43c4-9bc4-52ba40c7ab4f'
        },
        client_id: '56093359f26e8f31ec48aad1',
        voided: false,
        timestamp: '2016-04-15T11:21:27.000Z',
        updated_at: '2016-04-15T11:21:27.705Z',
      }, insertDone),
      personStatement: insertDone => Statement.create({
        active: true,
        _id: '563a679c0c5d017e4004714f',
        lrs_id: '560a679c0c5d017e4004714f',
        person: {
          _id: '56fe4ca6c2d1a09c15825792',
          display: 'George'
        },
        statement: {
          version: '1.0.0',
          actor: {
            objectType: 'Agent',
            mbox: 'mailto:ex@mple.com',
            name: 'Example'
          },
          verb: {
            id: 'http://www.example.com'
          },
          object: {
            objectType: 'Activity',
            id: 'http://www.example.com'
          },
          authority: {
            objectType: 'Agent',
            mbox: 'mailto:hello@learninglocker.net',
            name: 'New Client'
          },
          stored: '2016-04-13T12:34:58.392000+00:00',
          timestamp: '2016-04-13T12:34:58.392000+00:00',
          id: '5e56d6e9-e585-43c4-9bc4-52ba40c7ab4g'
        },
        client_id: '56093359f26e8f31ec48aad1',
        voided: false,
        timestamp: '2016-04-15T11:21:27.000Z',
        updated_at: '2016-04-15T11:21:27.705Z',
      }, insertDone)
    }, (err, results) => {
      this.actorStatement = results.actorStatement;
      this.personStatement = results.personStatement;
      done(err);
    });
  }

  cleanUp = (done) => {
    async.forEach([
      Statement,
      Lrs,
      QueryBuilderCache
    ], (model, doneDeleting) => {
      model.remove({}, doneDeleting);
    }, done);
  }
}
