import Organisation from 'lib/models/organisation';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';

export default async ({ authInfo, orgId }) => {
  const idFilter = { _id: orgId };
  const scopeFilter = await getScopeFilter({
    modelName: 'organisation',
    actionName: 'view',
    authInfo
  });
  const filter = { $and: [idFilter, scopeFilter] };
  const org = await Organisation.findOne(filter).exec();

  return {
    mime: org.logo.mime,
    key: `logos/${orgId}`
  };
};
