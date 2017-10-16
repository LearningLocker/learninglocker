import { MANAGE_ALL_CLIENTS } from 'lib/constants/orgScopes';
// import getGlobalModelFilter from 'lib/services/auth/filters/getGlobalModelFilter';
import getShareableModelFilter
  from 'lib/services/auth/filters/getShareableModelFilter';

export default getShareableModelFilter({
  editAllScope: MANAGE_ALL_CLIENTS,
});
