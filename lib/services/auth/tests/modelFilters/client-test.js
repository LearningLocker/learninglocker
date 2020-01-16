import testAdminModel from 'lib/services/auth/tests/utils/testAdminModel';
import { MANAGE_ALL_CLIENTS } from 'lib/constants/orgScopes';

testAdminModel({
  modelName: 'client',
  viewAllScopes: [MANAGE_ALL_CLIENTS],
  editAllScopes: [MANAGE_ALL_CLIENTS],
});
