import {
  VIEW_PUBLIC_DOWNLOADS,
  EDIT_PUBLIC_DOWNLOADS,
  VIEW_ALL_DOWNLOADS,
  EDIT_ALL_DOWNLOADS
} from 'lib/constants/orgScopes';
import getShareableModelFilter
  from 'lib/services/auth/filters/getShareableModelFilter';

export default getShareableModelFilter({
  viewAllScopes: [VIEW_ALL_DOWNLOADS],
  editAllScopes: [EDIT_ALL_DOWNLOADS],
  viewPublicScopes: [VIEW_PUBLIC_DOWNLOADS],
  editPublicScopes: [EDIT_PUBLIC_DOWNLOADS],
});
