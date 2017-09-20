import testShareableModel
  from 'lib/services/auth/tests/utils/testShareableModel';
import {
  VIEW_PUBLIC_EXPORTS,
  EDIT_PUBLIC_EXPORTS,
  VIEW_ALL_EXPORTS,
  EDIT_ALL_EXPORTS
} from 'lib/constants/orgScopes';

testShareableModel({
  modelName: 'export',
  viewAllScope: VIEW_ALL_EXPORTS,
  editAllScope: EDIT_ALL_EXPORTS,
  viewPublicScope: VIEW_PUBLIC_EXPORTS,
  editPublicScope: EDIT_PUBLIC_EXPORTS
});
