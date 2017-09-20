import Role from 'lib/models/role';
import testId from 'api/routes/tests/utils/testId';

export default (scopes = [], organisation = testId) =>
  Role.create({
    title: 'Test',
    owner_id: testId,
    organisation,
    scopes
  });
