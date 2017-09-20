import { createOrgJWT } from 'api/auth/jwt';
import createOwner from 'api/routes/tests/utils/models/createOwner';

export default async () => {
  const user = await createOwner();
  const org = user.organisations[0];
  const token = await createOrgJWT(user, org, 'native');
  return token;
};
