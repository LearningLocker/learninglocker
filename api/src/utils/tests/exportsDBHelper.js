import async from 'async';
import Statement from 'lib/models/statement';
import mongoose from 'mongoose';

const objectId = mongoose.Types.ObjectId;

export default class exportsDBHelpers {
  prepare = (done) => {
    async.parallel({
      statement1: insertDone => Statement.create({
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
      statement2: insertDone => Statement.create({
        active: true,
        _id: '562a679c0c5d017e4004714f',
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
      statement3: insertDone => Statement.create({
        active: true,
        _id: '563a679c0c5d017e4004714f',
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
    }, (err, results) => {
      this.statements = results;
      done(err);
    });
  }

  cleanUp = (done) => {
    async.forEach([
      Statement
    ], (model, doneDeleting) => {
      model.remove({}, doneDeleting);
    }, done);
  }

  xStream = [
    {
      _id: {
        objectType: 'Agent',
        name: 'Taylor Eyno',
        account: {
          name: '9e1117b8-a8d6-493a-88ea-9632baedaeee',
          homePage: 'http://beta.curatr3.com'
        }
      },
      name: 'Taylor Eyno',
      xCount: 2,
      identifier: objectId('0000000aa0a000a00aa00000'),
    },
    {
      _id: {
        objectType: 'Agent',
        name: 'Bill McDonald',
        account: {
          name: '2df799d1-bc96-4606-879e-3dabf66a424a',
          homePage: 'http://beta.curatr3.com'
        }
      },
      name: 'Bill McDonald',
      xCount: 4,
      identifier: objectId('0000000aa0a000a00aa00000'),
    },
    {
      _id: {
        objectType: 'Agent',
        name: 'Derek White',
        account: {
          name: '3fa9839f-fcaa-41ee-bb32-621c2d31f2db',
          homePage: 'http://beta.curatr3.com'
        }
      },
      name: 'Derek White',
      xCount: 9,
      identifier: objectId('0000000aa0a000a00aa00000'),
    }
  ]

  yStream = [
    {
      _id: {
        objectType: 'Agent',
        name: 'Taylor Eyno',
        account: {
          name: '9e1117b8-a8d6-493a-88ea-9632baedaeee',
          homePage: 'http://beta.curatr3.com'
        }
      },
      name: 'Taylor Eyno',
      yCount: 1,
      identifier: objectId('0000000aa0a000a00aa00000'),
    },
    {
      _id: {
        objectType: 'Agent',
        name: 'Bill McDonald',
        account: {
          name: '2df799d1-bc96-4606-879e-3dabf66a424a',
          homePage: 'http://beta.curatr3.com'
        }
      },
      name: 'Bill McDonald',
      yCount: 3,
      identifier: objectId('0000000aa0a000a00aa00000'),
    },
    {
      _id: {
        objectType: 'Agent',
        name: 'Mark Chrisman',
        account: {
          name: '9a786dfd-3079-4324-bfb0-2ac3925c4133',
          homePage: 'http://beta.curatr3.com'
        }
      },
      name: 'Mark Chrisman',
      yCount: 3,
      identifier: objectId('0000000aa0a000a00aa00000'),
    },
    {
      _id: {
        objectType: 'Agent',
        name: 'Derek White',
        account: {
          name: '3fa9839f-fcaa-41ee-bb32-621c2d31f2db',
          homePage: 'http://beta.curatr3.com'
        }
      },
      name: 'Derek White',
      yCount: 3,
      identifier: objectId('0000000aa0a000a00aa00000'),
    }
  ]

  singleStream = [{
    _id: '{"objectType":"Agent","name":"Taylor Eyno","account":{"name":"9e1117b8-a8d6-493a-88ea-9632baedaeee","homePage":"http://beta.curatr3.com"}}',
    name: 'Taylor Eyno',
    xCount: '2',
    yCount: '1',
    identifier: '0000000aa0a000a00aa00000',
  }, {
    _id: '{"objectType":"Agent","name":"Bill McDonald","account":{"name":"2df799d1-bc96-4606-879e-3dabf66a424a","homePage":"http://beta.curatr3.com"}}',
    name: 'Bill McDonald',
    xCount: '4',
    yCount: '3',
    identifier: '0000000aa0a000a00aa00000',
  }, {
    _id: '{"objectType":"Agent","name":"Derek White","account":{"name":"3fa9839f-fcaa-41ee-bb32-621c2d31f2db","homePage":"http://beta.curatr3.com"}}',
    name: 'Derek White',
    xCount: '9',
    yCount: '3',
    identifier: '0000000aa0a000a00aa00000',
  }, {
    _id: '{"objectType":"Agent","name":"Mark Chrisman","account":{"name":"9a786dfd-3079-4324-bfb0-2ac3925c4133","homePage":"http://beta.curatr3.com"}}',
    name: 'Mark Chrisman',
    yCount: '3',
    identifier: '0000000aa0a000a00aa00000',
  }]
}
