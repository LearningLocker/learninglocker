import {
  VIEW_PUBLIC_QUERIES,
  EDIT_PUBLIC_QUERIES,
  VIEW_ALL_QUERIES,
  EDIT_ALL_QUERIES
} from 'lib/constants/orgScopes';
import getShareableModelFilter
  from 'lib/services/auth/filters/getShareableModelFilter';

export default getShareableModelFilter({
  viewAllScope: VIEW_ALL_QUERIES,
  editAllScope: EDIT_ALL_QUERIES,
  viewPublicScope: VIEW_PUBLIC_QUERIES,
  editPublicScope: EDIT_PUBLIC_QUERIES
});
