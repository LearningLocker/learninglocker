import getUserScopeSelect from 'lib/services/auth/selects/models/user';

export default async ({ modelName, actionName, authInfo }) => {
  switch (modelName.toLowerCase()) {
    case 'user':
      return getUserScopeSelect({ actionName, authInfo });
    default:
      // return the default "null" which will allows all selects
      return;
  }
};
