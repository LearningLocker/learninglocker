import getParsedScopedFilter from './getParsedScopedFilter';

export default async function deleteById({ authInfo, _id }) {
  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter: { _id },
    modelName: this.modelName,
    actionName: 'delete'
  });
  return this.deleteOne(parsedScopeFilter).then(() => _id);
}
