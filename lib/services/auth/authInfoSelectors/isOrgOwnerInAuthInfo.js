import Organisation from 'lib/models/organisation';
import getUserIdFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getUserIdFromAuthInfo';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';

export default async (authInfo) => {
  const userId = getUserIdFromAuthInfo(authInfo);
  const orgId = getOrgFromAuthInfo(authInfo);
  if (!userId || !orgId) return false;
  const organisation = await Organisation.findById(orgId);
  return (
    organisation.owner && organisation.owner.toString() === userId.toString()
  );
};
