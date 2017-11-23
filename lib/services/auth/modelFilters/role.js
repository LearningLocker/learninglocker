import { MANAGE_ALL_ROLES } from 'lib/constants/orgScopes';
import getAdminModelFilter
  from 'lib/services/auth/filters/getAdminModelFilter';

export default getAdminModelFilter({
  viewAllScope: MANAGE_ALL_ROLES,
  editAllScope: MANAGE_ALL_ROLES,
});
