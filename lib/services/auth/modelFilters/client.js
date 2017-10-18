import { MANAGE_ALL_CLIENTS } from 'lib/constants/orgScopes';
import getAdminModelFilter
  from 'lib/services/auth/filters/getAdminModelFilter';

export default getAdminModelFilter({
  viewAllScope: MANAGE_ALL_CLIENTS,
  editAllScope: MANAGE_ALL_CLIENTS,
});
