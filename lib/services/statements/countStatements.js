import Statement from 'lib/models/statement';
import parseQuery from 'lib/helpers/parseQuery';

export default async ({ filter, authInfo, maxTimeMS, hint }) => {
  const parsedFilter = await parseQuery(filter, { authInfo });
  return Statement.getCount({
    filter: parsedFilter,
    authInfo,
    maxTimeMS,
    hint
  });
};
