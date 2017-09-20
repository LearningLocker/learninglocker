import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import getAuthInfoFromReq
  from 'lib/services/auth/requestSelectors/getAuthInfoFromReq';
import getActionNameFromReq
  from 'lib/services/auth/requestSelectors/getActionNameFromReq';
import getModelNameFromReq
  from 'lib/services/auth/requestSelectors/getModelNameFromReq';

export default async (req) => {
  const modelName = getModelNameFromReq(req);
  const actionName = getActionNameFromReq(req);
  const body = req.body;
  const authInfo = getAuthInfoFromReq(req);
  const scopeFilter = await getScopeFilter({
    modelName,
    actionName,
    authInfo,
    body
  });
  return scopeFilter;
};
