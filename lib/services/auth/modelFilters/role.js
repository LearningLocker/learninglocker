import { MANAGE_ALL_ROLES, MANAGE_ALL_USERS } from 'lib/constants/orgScopes';
import getAdminModelFilter
  from 'lib/services/auth/filters/getAdminModelFilter';

export default getAdminModelFilter({
  viewAllScopes: [MANAGE_ALL_ROLES, MANAGE_ALL_USERS],
  editAllScopes: [MANAGE_ALL_ROLES],
});
