import Organisation from 'lib/models/organisation';
import testId from 'api/routes/tests/utils/testId';
import ownerId from 'api/routes/tests/utils/ownerId';

export default () =>
  Organisation.create({
    _id: testId,
    name: 'Test organisation',
    owner: ownerId
  });
