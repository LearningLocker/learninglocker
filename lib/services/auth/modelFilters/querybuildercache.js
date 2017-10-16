import { ALL } from 'lib/constants/scopes';
import getShareableModelFilter
  from 'lib/services/auth/filters/getShareableModelFilter';

export default getShareableModelFilter({
  editAllScope: ALL,
});
