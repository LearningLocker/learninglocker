import { createUserJWT } from 'api/auth/jwt';
import createUser from 'api/routes/tests/utils/models/createUser';
import testId from 'api/routes/tests/utils/testId';

export default async (siteScopes, id = testId) => {
  const user = await createUser({
    _id: id,
    email: `${id}@example.com`,
    scopes: siteScopes,
    organisations: [testId]
  });
  const token = await createUserJWT(user, 'native');
  return token;
};
