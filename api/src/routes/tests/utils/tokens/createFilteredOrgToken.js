import { createOrgJWT } from 'api/auth/jwt';
import createRole from 'api/routes/tests/utils/models/createRole';
import createUser from 'api/routes/tests/utils/models/createUser';
import { ALL } from 'lib/constants/scopes';

export default async (orgScopes = [ALL], orgFilter = {}) => {
  const role = await createRole(orgScopes);
  const user = await createUser(
    {
      roles: [role._id]
    },
    {
      filter: JSON.stringify(orgFilter)
    }
  );
  const org = user.organisations[0];
  const token = await createOrgJWT(user, org, 'native');
  return token;
};
