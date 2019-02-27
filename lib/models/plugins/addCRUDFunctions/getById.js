import { first } from 'lodash';
import getScopeSelect from 'lib/services/auth/selects/getScopeSelect';
import getParsedScopedFilter from './getParsedScopedFilter';
import postFetchMap from './postFetchMap';

export default async function getById({ _id, authInfo }) {
  const modelName = this.modelName;
  const actionName = 'view';

  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter: { _id },
    modelName,
    actionName,
  });
  const query = this.find(parsedScopeFilter)
    .limit(1);

  const scopeSelect = await getScopeSelect({
    modelName,
    actionName,
    authInfo,
  });
  if (scopeSelect) {
    query.select(scopeSelect);
  }

  return query
    .exec()
    .then(models =>
      postFetchMap.bind(this)(first(models))
    );
}
