import { createOrgJWT } from 'api/auth/jwt';
import createRole from 'api/routes/tests/utils/models/createRole';
import createUser from 'api/routes/tests/utils/models/createUser';
import testId from 'api/routes/tests/utils/testId';
import { ALL } from 'lib/constants/scopes';

export default async (orgScopes = [ALL], siteScopes = [], id = testId) => {
  const role = await createRole(orgScopes);
  const user = await createUser(
    {
      scopes: siteScopes,
      _id: id,
      email: `${id}@example.com`
    },
    {
      roles: [role._id]
    }
  );
  const org = user.organisations[0];
  const token = await createOrgJWT(user, org, 'native');
  return token;
};
