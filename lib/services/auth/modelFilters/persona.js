import { MANAGE_ALL_PERSONAS } from 'lib/constants/orgScopes';
import { VIEW_SHAREABLE_DASHBOARD } from 'lib/constants/scopes';
import getGlobalModelFilter
  from 'lib/services/auth/filters/getGlobalModelFilter';

export default getGlobalModelFilter({
  editAllScopes: [MANAGE_ALL_PERSONAS, VIEW_SHAREABLE_DASHBOARD],
});
