import getUserScopeSelect from 'lib/services/auth/selects/models/user';

export default async (opts) => {
  switch (opts.modelName.toLowerCase()) {
    case 'user':
      return getUserScopeSelect(opts);
    default:
      // return the default "null" which will allows all selects
      return;
  }
};
