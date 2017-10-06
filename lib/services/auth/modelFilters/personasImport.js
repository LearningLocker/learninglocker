import {
  VIEW_PUBLIC_PERSONASIMPORT,
  EDIT_PUBLIC_PERSONASIMPORT,
  VIEW_ALL_PERSONASIMPORT,
  EDIT_ALL_PERSONASIMPORT
} from 'lib/constants/orgScopes';
import getShareableModelFilter from 'lib/services/auth/filters/getShareableModelFilter';

export default getShareableModelFilter({
  viewPublicScope: VIEW_PUBLIC_PERSONASIMPORT,
  editPublicScope: EDIT_PUBLIC_PERSONASIMPORT,
  viewAllScope: VIEW_ALL_PERSONASIMPORT,
  editAllScope: EDIT_ALL_PERSONASIMPORT,
});
