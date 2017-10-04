import {
  VIEW_PUBLIC_PERSONAIMPORTTEMPLATE,
  EDIT_PUBLIC_PERSONAIMPORTTEMPLATE,
  VIEW_ALL_PERSONAIMPORTTEMPLATE,
  EDIT_ALL_PERSONAIMPORTTEMPLATE
} from 'lib/constants/orgScopes';
import getShareableModelFilter from 'lib/services/auth/filters/getShareableModelFilter';

export default getShareableModelFilter({
  viewAllScope: VIEW_PUBLIC_PERSONAIMPORTTEMPLATE,
  editAllScope: EDIT_PUBLIC_PERSONAIMPORTTEMPLATE,
  viewPublicScope: VIEW_ALL_PERSONAIMPORTTEMPLATE,
  editPublicScope: EDIT_ALL_PERSONAIMPORTTEMPLATE,
});
