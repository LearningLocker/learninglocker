import {
  VIEW_PUBLIC_STATEMENTFORWARDING,
  EDIT_PUBLIC_STATEMENTFORWARDING,
  VIEW_ALL_STATEMENTFORWARDING,
  EDIT_ALL_STATEMENTFORWARDING
} from 'lib/constants/orgScopes';
import getShareableModelFilter from 'lib/services/auth/filters/getShareableModelFilter';

export default getShareableModelFilter({
  viewAllScope: VIEW_PUBLIC_STATEMENTFORWARDING,
  editAllScope: EDIT_PUBLIC_STATEMENTFORWARDING,
  viewPublicScope: VIEW_ALL_STATEMENTFORWARDING,
  editPublicScope: EDIT_ALL_STATEMENTFORWARDING,
});
