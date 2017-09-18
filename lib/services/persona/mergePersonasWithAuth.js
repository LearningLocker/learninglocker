import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import mergePersonas from 'lib/services/persona/mergePersonas';

export default async (authInfo, mergePersonaFromId, mergePersonaToId) => {
  await getScopeFilter({
    modelName: 'persona',
    actionName: 'edit',
    authInfo
  });
  const organisation = getOrgFromAuthInfo(authInfo);
  return mergePersonas(organisation, mergePersonaFromId, mergePersonaToId);
};
