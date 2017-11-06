import getScopeSelect from 'lib/services/auth/selects/getScopeSelect';
import getAuthInfoFromReq
  from 'lib/services/auth/requestSelectors/getAuthInfoFromReq';
import getActionNameFromReq
  from 'lib/services/auth/requestSelectors/getActionNameFromReq';
import getModelNameFromReq
  from 'lib/services/auth/requestSelectors/getModelNameFromReq';

export default async (req) => {
  const actionName = getActionNameFromReq(req);
  if (actionName !== 'view') {
    return;
  }
  const modelName = getModelNameFromReq(req);
  const authInfo = getAuthInfoFromReq(req);
  const scopeSelect = await getScopeSelect({
    modelName,
    actionName,
    authInfo,
  });
  return scopeSelect;
};
