import { isEmpty, includes } from 'lodash';
import { getConnection as getDBConnection } from 'lib/connections/mongoose';
import { MAX_TIME_MS, MAX_SCAN } from 'lib/constants/addCRUDFunctions';
import getParsedScopedFilter from './getParsedScopedFilter';

const getLrsStatementCount = ({ orgFilter, maxTimeMS, maxScan, hint }) => {
  const LRS = getDBConnection().model('Lrs');
  const query = LRS.collection.find(orgFilter, {}, { maxTimeMS, maxScan });
  if (hint) query.hint(hint);
  return query
    .project({ statementCount: 1 })
    .toArray()
    .then(docs => docs.reduce((count, doc) => count + doc.statementCount, 0));
};

export default async function getCount({
  filter,
  authInfo,
  maxTimeMS = MAX_TIME_MS,
  maxScan = MAX_SCAN,
  hint
}) {
  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter,
    modelName: this.modelName,
    actionName: 'view'
  });
  const canUseLrsCount =
    this.modelName === 'Statement' &&
    isEmpty(filter) &&
    Object.keys(parsedScopeFilter).length === 1 &&
    includes(Object.keys(parsedScopeFilter), 'organisation');
  if (canUseLrsCount) {
    return getLrsStatementCount({
      orgFilter: parsedScopeFilter,
      maxTimeMS,
      maxScan,
      hint
    });
  }
  const query = this.find(parsedScopeFilter, {}, { maxTimeMS, maxScan });
  if (hint) query.hint(hint);
  return query.select({ _id: 0, organisation: 1 }).countDocuments();
}
