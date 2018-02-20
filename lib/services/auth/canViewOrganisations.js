import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import intersection from 'lodash/intersection';
import boolean from 'boolean';
import defaultTo from 'lodash/defaultTo';


export default (activeScopes, {
  SUPERADMIN_EDIT_ORGANISATION_ONLY = boolean(defaultTo(process.env.SUPERADMIN_EDIT_ORGANISATION_ONLY, true))
}) => {
  const viewScope = 'org/all/organisation/manage';
  const requiredScopes = [viewScope, SITE_ADMIN, ...(SUPERADMIN_EDIT_ORGANISATION_ONLY ? [] : [ALL])];

  const matchingScopes = intersection(requiredScopes, activeScopes);
  return matchingScopes.length !== 0;
};
