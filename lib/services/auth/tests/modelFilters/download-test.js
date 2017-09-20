import testShareableModel
  from 'lib/services/auth/tests/utils/testShareableModel';
import {
  VIEW_PUBLIC_DOWNLOADS,
  EDIT_PUBLIC_DOWNLOADS,
  VIEW_ALL_DOWNLOADS,
  EDIT_ALL_DOWNLOADS
} from 'lib/constants/orgScopes';

testShareableModel({
  modelName: 'download',
  viewAllScope: VIEW_ALL_DOWNLOADS,
  editAllScope: EDIT_ALL_DOWNLOADS,
  viewPublicScope: VIEW_PUBLIC_DOWNLOADS,
  editPublicScope: EDIT_PUBLIC_DOWNLOADS
});
