import User from 'lib/models/user';
import testId from 'api/routes/tests/utils/testId';
import ownerId from 'api/routes/tests/utils/ownerId';

export default (userId = ownerId) =>
  User.create({
    _id: userId,
    email: 'testy@mctestface.com',
    password: 'password1',
    organisations: [testId],
    scopes: []
  });
