import {
  VIEW_PUBLIC_EXPORTS,
  EDIT_PUBLIC_EXPORTS,
  VIEW_ALL_EXPORTS,
  EDIT_ALL_EXPORTS
} from 'lib/constants/orgScopes';
import getShareableModelFilter
  from 'lib/services/auth/filters/getShareableModelFilter';

export default getShareableModelFilter({
  viewAllScope: VIEW_ALL_EXPORTS,
  editAllScope: EDIT_ALL_EXPORTS,
  viewPublicScope: VIEW_PUBLIC_EXPORTS,
  editPublicScope: EDIT_PUBLIC_EXPORTS
});
