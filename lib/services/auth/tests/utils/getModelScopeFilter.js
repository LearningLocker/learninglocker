import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';

export default (modelName, actionName, token, user, client = undefined) =>
  getScopeFilter({
    modelName,
    actionName,
    authInfo: { token, user, client },
  });
