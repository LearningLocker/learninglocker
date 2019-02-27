import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getParsedScopedFilter from './getParsedScopedFilter';
import postFetchMap from './postFetchMap';

export default async function updateById({ _id, authInfo, record }) {
  const parsedScopeFilter = await getParsedScopedFilter({
    authInfo,
    filter: { _id },
    modelName: this.modelName,
    actionName: 'edit'
  });
  const organisation = getOrgFromAuthInfo(authInfo, { _id });
  const nextProps = { ...record, organisation };

  await this.updateOne(parsedScopeFilter, nextProps);
  const result = await this.findOne(parsedScopeFilter);

  return postFetchMap.bind(this)(result);
}
