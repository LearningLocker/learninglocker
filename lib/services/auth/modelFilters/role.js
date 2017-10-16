import { MANAGE_ALL_ROLES } from 'lib/constants/orgScopes';
import getShareableModelFilter
  from 'lib/services/auth/filters/getShareableModelFilter';

export default getShareableModelFilter({
  editAllScope: MANAGE_ALL_ROLES,
});
