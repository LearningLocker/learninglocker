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
  const body = req.body;
  const authInfo = getAuthInfoFromReq(req);
  const scopeFilter = await getScopeSelect({
    modelName,
    actionName,
    authInfo,
    body
  });
  return scopeFilter;
};
