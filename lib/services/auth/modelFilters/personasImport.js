import {
  VIEW_PUBLIC_PERSONAIMPORT,
  EDIT_PUBLIC_PERSONAIMPORT,
  VIEW_ALL_PERSONAIMPORT,
  EDIT_ALL_PERSONAIMPORT
} from 'lib/constants/orgScopes';
import getShareableModelFilter from 'lib/services/auth/filters/getShareableModelFilter';

export default getShareableModelFilter({
  viewAllScope: VIEW_PUBLIC_PERSONAIMPORT,
  editAllScope: EDIT_PUBLIC_PERSONAIMPORT,
  viewPublicScope: VIEW_ALL_PERSONAIMPORT,
  editPublicScope: EDIT_ALL_PERSONAIMPORT,
});
