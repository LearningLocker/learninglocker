import testShareableModel
  from 'lib/services/auth/tests/utils/testShareableModel';
import {
  VIEW_PUBLIC_STATEMENTFORWARDING,
  EDIT_PUBLIC_STATEMENTFORWARDING,
  VIEW_ALL_STATEMENTFORWARDING,
  EDIT_ALL_STATEMENTFORWARDING,
} from 'lib/constants/orgScopes';

testShareableModel({
  modelName: 'statementforwarding',
  viewAllScope: VIEW_ALL_STATEMENTFORWARDING,
  editAllScope: EDIT_ALL_STATEMENTFORWARDING,
  viewPublicScope: VIEW_PUBLIC_STATEMENTFORWARDING,
  editPublicScope: EDIT_PUBLIC_STATEMENTFORWARDING,
});
