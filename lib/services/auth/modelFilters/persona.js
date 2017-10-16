import { MANAGE_ALL_PERSONAS } from 'lib/constants/orgScopes';
import getGlobalModelFilter
  from 'lib/services/auth/filters/getGlobalModelFilter';

export default getGlobalModelFilter({
  editAllScope: MANAGE_ALL_PERSONAS,
});
