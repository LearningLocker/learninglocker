import testId from 'api/routes/tests/utils/testId';
import User from 'lib/models/user';

export default (overrides = {}, orgSettings = {}) =>
  User.create({
    _id: testId,
    email: 'user@example.com',
    password: 'password2',
    organisations: [testId],
    organisationSettings: [
      {
        organisation: testId,
        roles: [],
        filter: JSON.stringify({}),
        ...orgSettings
      }
    ],
    scopes: [],
    ...overrides
  });
