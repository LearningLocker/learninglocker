import User from 'lib/models/user';
import testId from 'api/routes/tests/utils/testId';
import ownerId from 'api/routes/tests/utils/ownerId';

export default () =>
  User.create({
    _id: ownerId,
    email: 'testy@mctestface.com',
    password: 'password1',
    organisations: [testId],
    scopes: []
  });
