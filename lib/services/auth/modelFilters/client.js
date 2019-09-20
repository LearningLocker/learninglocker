import { MANAGE_ALL_CLIENTS } from 'lib/constants/orgScopes';
import getAdminModelFilter
  from 'lib/services/auth/filters/getAdminModelFilter';

export default getAdminModelFilter({
  viewAllScopes: [MANAGE_ALL_CLIENTS],
  editAllScopes: [MANAGE_ALL_CLIENTS],
});
