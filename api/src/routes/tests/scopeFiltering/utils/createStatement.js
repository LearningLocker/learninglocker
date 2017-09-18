import { v4 as uuid } from 'uuid';
import Statement from 'lib/models/statement';
import testId from 'api/routes/tests/utils/testId';

export default (statement = {}, organisation = testId) =>
  Statement.create({
    lrs: { _id: testId },
    lrs_id: testId,
    organisation,
    client: testId,
    client_id: testId,
    statement: {
      actor: {
        objectType: 'Agent',
        mbox: 'mailto:test@example.com'
      },
      verb: {
        id: 'http://www.example.com/verb'
      },
      object: {
        objectType: 'Activity',
        id: 'http://www.example.com/activity'
      },
      version: '1.0.0',
      timestamp: '2016-10-15T23:00:00.000Z',
      authority: {
        objectType: 'Agent',
        name: 'New Client',
        mbox: 'mailto:hello@learninglocker.net'
      },
      stored: '2017-04-27T09:41:54.606500+00:00',
      id: uuid(),
      ...statement
    },
    active: true,
    voided: false,
    timestamp: '2016-10-15T23:00:00Z',
    stored: '2017-04-27T09:41:54.606Z',
    processingQueues: [],
    personaIdentifier: testId,
    person: {
      _id: testId,
      display: 'Joey Wendle'
    },
    completedQueues: [
      'STATEMENT_PERSON_QUEUE',
      'STATEMENT_QUERYBUILDERCACHE_QUEUE'
    ]
  });
