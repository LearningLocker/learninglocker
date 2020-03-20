import { MANAGE_ALL_PERSONAS } from 'lib/constants/orgScopes';
import getGlobalModelFilter
  from 'lib/services/auth/filters/getGlobalModelFilter';

export default getGlobalModelFilter({
  editAllScopes: [MANAGE_ALL_PERSONAS],
});
