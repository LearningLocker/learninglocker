import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import getPrivateOrgFilter from 'lib/services/auth/filters/getPrivateOrgFilter';

export default (authInfo) => {
  const orgFilter = getOrgFilter(authInfo);
  const privateFilter = getPrivateOrgFilter(authInfo);
  const publicFilter = { $and: [{ isPublic: true }, orgFilter] };
  return { $or: [
    publicFilter,
    ...(privateFilter ? [privateFilter] : [])
  ] };
};
