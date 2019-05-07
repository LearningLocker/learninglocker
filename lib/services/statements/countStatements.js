import Statement from 'lib/models/statement';
import parseQuery from 'lib/helpers/parseQuery';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';

export default async ({ filter, authInfo, maxTimeMS, maxScan, hint }) => {
  const parsedFilter = await parseQuery(filter, { authInfo });
  return Statement.getCount({
    filter: parsedFilter,
    authInfo,
    maxTimeMS,
    maxScan,
    hint
  });
};
