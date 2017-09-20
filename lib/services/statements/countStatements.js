import Statement from 'lib/models/statement';
import parseQuery from 'lib/helpers/parseQuery';

export default async ({ filter, authInfo, maxTimeMS, maxScan, hint }) => {
  const parsedFilter = await parseQuery(filter);
  return Statement.getCount({
    filter: parsedFilter,
    authInfo,
    maxTimeMS,
    maxScan,
    hint
  });
};
