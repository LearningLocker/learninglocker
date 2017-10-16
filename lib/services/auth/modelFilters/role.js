import { MANAGE_ALL_ROLES } from 'lib/constants/orgScopes';
import getGlobalModeFilter
  from 'lib/services/auth/filters/getGlobalModeFilter';

export default getGlobalModeFilter({
  editAllScope: MANAGE_ALL_ROLES,
});
