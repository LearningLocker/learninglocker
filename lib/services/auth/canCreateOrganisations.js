import { SITE_ADMIN, SITE_CAN_CREATE_ORG, ALL } from 'lib/constants/scopes';
import intersection from 'lodash/intersection';
import boolean from 'boolean';
import defaultTo from 'lodash/defaultTo';


export default (activeScopes, {
  RESTRICT_CREATE_ORGANISATION = boolean(defaultTo(process.env.RESTRICT_CREATE_ORGANISATION, true))
}) => {
  const viewScope = 'org/all/organisation/manage';
  const requiredScopes = [
    viewScope,
    SITE_ADMIN,
    SITE_CAN_CREATE_ORG,
    ...(RESTRICT_CREATE_ORGANISATION ? [] : [ALL])
  ];

  const matchingScopes = intersection(requiredScopes, activeScopes);
  return matchingScopes.length !== 0;
};
