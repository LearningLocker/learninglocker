import find from 'lodash/find';

const matchActiveOrgSettings = orgId =>
  (orgSettings) => {
    const org = orgSettings.organisation;
    return org && org.toString() === orgId.toString();
  };

export default (user, orgId) => {
  const allOrgSettings = user.organisationSettings;
  const activeOrgSettings = find(allOrgSettings, matchActiveOrgSettings(orgId));
  return activeOrgSettings || {
    filter: '{}',
    roles: [],
  };
};
