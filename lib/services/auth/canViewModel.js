import { SITE_ADMIN, ALL } from 'lib/constants/scopes';
import intersection from 'lodash/intersection';

export default (modelName, activeScopes) => {
  const viewScope = `org/all/${modelName}/manage`;
  const requiredScopes = [viewScope, SITE_ADMIN, ALL];
  const matchingScopes = intersection(requiredScopes, activeScopes);
  return matchingScopes.length !== 0;
};
