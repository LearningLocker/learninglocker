import {
  VIEW_PUBLIC_EXPORTS,
  EDIT_PUBLIC_EXPORTS,
  VIEW_ALL_EXPORTS,
  EDIT_ALL_EXPORTS
} from 'lib/constants/orgScopes';
import getShareableModelFilter
  from 'lib/services/auth/filters/getShareableModelFilter';

export default getShareableModelFilter({
  viewAllScopes: [VIEW_ALL_EXPORTS],
  editAllScopes: [EDIT_ALL_EXPORTS],
  viewPublicScopes: [VIEW_PUBLIC_EXPORTS],
  editPublicScopes: [EDIT_PUBLIC_EXPORTS],
});
