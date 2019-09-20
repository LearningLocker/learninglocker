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
  viewAllScopes: [VIEW_ALL_STATEMENTFORWARDING],
  editAllScopes: [EDIT_ALL_STATEMENTFORWARDING],
  viewPublicScopes: [VIEW_PUBLIC_STATEMENTFORWARDING],
  editPublicScopes: [EDIT_PUBLIC_STATEMENTFORWARDING],
});
