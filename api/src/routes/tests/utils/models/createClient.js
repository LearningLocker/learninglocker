import Client from 'lib/models/client';
import testId from 'api/routes/tests/utils/testId';

export default (scopes = []) =>
  Client.create({
    _id: testId,
    organisation: testId,
    name: 'Test client',
    scopes
  });
