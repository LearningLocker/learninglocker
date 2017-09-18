import async from 'async';
import Statement from 'lib/models/statement';
import mongoose from 'mongoose';

export const data = {};

const statement1Id = new mongoose.Types.ObjectId();

const id = '5e56d6e9-e585-43c4-9bc4-52ba40c7ab4f';
const actor = {
  objectType: 'Agent',
  mbox: 'mailto:ex@mple.com',
  name: 'Example'
};
const shortActor = {
  objectType: 'Agent',
  mbox: actor.mbox
};

const verb = {
  id: 'http://www.verb.com',
  display: {
    'en-GB': 'An example verb',
    'en-US': 'An example verb'
  }
};

const extensions = {
  'http://extensions&46;key1': 1,
  'http://extensions&46;key2': { foo: 'bar' },
  'http://extensions&46;key3': ['these', 'are', 'strings'],
};

const object = {
  objectType: 'Activity',
  id: 'http://www.example.com',
  definition: {
    name: {
      'en-GB': 'An example object',
      'en-US': 'An example object'
    },
    description: {
      'en-US': 'An example object description'
    },
    type: 'http://example.com/type',
    extensions,
  },
};
const shortObject = { id: object.id, definition: { name: object.definition.name } };

const object2 = {
  objectType: 'Activity',
  id: 'http://www.google.com',
  definition: {
    name: {
      'en-GB': 'Google',
      'en-US': 'Google'
    },
    description: {
      'en-US': 'Web search'
    },
    type: 'http://example.com/type'
  }
};
const shortObject2 = { id: object2.id, definition: { name: object2.definition.name } };

const authority = {
  objectType: 'Agent',
  mbox: 'mailto:hello@learninglocker.net',
  name: 'New Client',
};
const shortAuthority = {
  objectType: 'Agent',
  mbox: authority.mbox
};

const group = {
  objectType: 'Group',
  member: [actor],
  name: 'Named group'
};

const registration = '7bce6b99-96ac-11e6-b09c-bc764e084f25';


const result1 = [
  { path: ['statement', 'authority'], value: shortAuthority, fullValue: authority, display: authority.name },
  { path: ['statement', 'actor'], value: shortActor, fullValue: actor, display: actor.name },
  { path: ['statement', 'verb'], value: { id: verb.id }, fullValue: verb, display: verb.display },

  { path: ['statement', 'object'], value: { id: shortObject.id }, fullValue: shortObject, display: shortObject.definition.name },
  { path: ['statement', 'object', 'definition', 'type'], value: object.definition.type, fullValue: object.definition.type, display: null },
  { path: ['statement', 'object', 'definition', 'extensions', 'http://extensions&46;key3'], value: extensions['http://extensions&46;key3'][0], fullValue: extensions['http://extensions&46;key3'][0], display: null },
  { path: ['statement', 'object', 'definition', 'extensions', 'http://extensions&46;key3'], value: extensions['http://extensions&46;key3'][1], fullValue: extensions['http://extensions&46;key3'][1], display: null },
  { path: ['statement', 'object', 'definition', 'extensions', 'http://extensions&46;key3'], value: extensions['http://extensions&46;key3'][2], fullValue: extensions['http://extensions&46;key3'][2], display: null },
  { path: ['statement', 'object', 'definition', 'extensions', 'http://extensions&46;key2', 'foo'], value: extensions['http://extensions&46;key2'].foo, fullValue: extensions['http://extensions&46;key2'].foo, display: null },
  { path: ['statement', 'object', 'definition', 'extensions', 'http://extensions&46;key1'], value: extensions['http://extensions&46;key1'], fullValue: extensions['http://extensions&46;key1'], display: null },

  { path: ['statement', 'context', 'registration'], value: registration, fullValue: registration, display: null },
  { path: ['statement', 'context', 'instructor'], value: shortActor, fullValue: actor, display: actor.name },
  { path: ['statement', 'context', 'team'], value: { objectType: group.objectType, member: group.member }, fullValue: group, display: group.name },
  { path: ['statement', 'context', 'revision'], value: 'v1.0.0', fullValue: 'v1.0.0', display: null },
  { path: ['statement', 'context', 'platform'], value: 'Example Platform', fullValue: 'Example Platform', display: null },
  { path: ['statement', 'context', 'language'], value: 'en-US', fullValue: 'en-US', display: null },

  { path: ['statement', 'context', 'contextActivities', 'category'], value: { id: shortObject.id }, fullValue: shortObject, display: shortObject.definition.name },
  { path: ['statement', 'context', 'contextActivities', 'category'], value: { id: shortObject2.id }, fullValue: shortObject2, display: shortObject2.definition.name },
  { path: ['statement', 'context', 'contextActivities', 'grouping'], value: { id: shortObject.id }, fullValue: shortObject, display: shortObject.definition.name },
  { path: ['statement', 'context', 'contextActivities', 'parent'], value: { id: shortObject2.id }, fullValue: shortObject2, display: shortObject2.definition.name },

  { path: ['statement', 'context', 'extensions', 'http://extensions&46;key3'], value: extensions['http://extensions&46;key3'][0], fullValue: extensions['http://extensions&46;key3'][0], display: null },
  { path: ['statement', 'context', 'extensions', 'http://extensions&46;key3'], value: extensions['http://extensions&46;key3'][1], fullValue: extensions['http://extensions&46;key3'][1], display: null },
  { path: ['statement', 'context', 'extensions', 'http://extensions&46;key3'], value: extensions['http://extensions&46;key3'][2], fullValue: extensions['http://extensions&46;key3'][2], display: null },
  { path: ['statement', 'context', 'extensions', 'http://extensions&46;key2', 'foo'], value: extensions['http://extensions&46;key2'].foo, fullValue: extensions['http://extensions&46;key2'].foo, display: null },
  { path: ['statement', 'context', 'extensions', 'http://extensions&46;key1'], value: extensions['http://extensions&46;key1'], fullValue: extensions['http://extensions&46;key1'], display: null },

  { path: ['statement', 'result', 'extensions', 'http://extensions&46;key3'], value: extensions['http://extensions&46;key3'][0], fullValue: extensions['http://extensions&46;key3'][0], display: null },
  { path: ['statement', 'result', 'extensions', 'http://extensions&46;key3'], value: extensions['http://extensions&46;key3'][1], fullValue: extensions['http://extensions&46;key3'][1], display: null },
  { path: ['statement', 'result', 'extensions', 'http://extensions&46;key3'], value: extensions['http://extensions&46;key3'][2], fullValue: extensions['http://extensions&46;key3'][2], display: null },
  { path: ['statement', 'result', 'extensions', 'http://extensions&46;key2', 'foo'], value: extensions['http://extensions&46;key2'].foo, fullValue: extensions['http://extensions&46;key2'].foo, display: null },
  { path: ['statement', 'result', 'extensions', 'http://extensions&46;key1'], value: extensions['http://extensions&46;key1'], fullValue: extensions['http://extensions&46;key1'], display: null },
];

export const prepare = (done) => {
  async.parallel({

    statement1: insertDone => Statement.create({
      active: true,
      _id: statement1Id,
      lrs_id: '560a679c0c5d017e4004714f',
      statement: {
        id,
        version: '1.0.0',
        actor,
        verb,
        object,
        context: {
          registration,
          instructor: actor,
          team: group,
          revision: 'v1.0.0',
          platform: 'Example Platform',
          language: 'en-US',
          statement: {
            id,
            objectType: 'StatementRef'
          },
          contextActivities: {
            category: [object, object2],
            grouping: [object],
            parent: [object2],
            other: []
          },
          extensions
        },
        result: {
          extensions
        },
        authority,
        stored: '2016-04-13T12:34:58.392000+00:00',
        timestamp: '2016-04-13T12:34:58.392000+00:00',
      },
      client_id: '56093359f26e8f31ec48aad1',
      voided: false,
      timestamp: '2016-04-15T11:21:27.000Z',
      updated_at: '2016-04-15T11:21:27.705Z',
    }, insertDone),

  }, (err, results) => {
    data.statement1 = results.statement1;
    data.result1 = result1;
    done(err);
  });
};

export const cleanUp = (done) => {
  async.forEach([
    Statement
  ], (model, doneDeleting) => {
    model.remove({}, doneDeleting);
  }, done);
};
