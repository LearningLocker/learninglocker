import testAdminModel from 'lib/services/auth/tests/utils/testAdminModel';
import { MANAGE_ALL_ROLES, MANAGE_ALL_USERS } from 'lib/constants/orgScopes';

testAdminModel({
  modelName: 'role',
  viewAllScopes: [MANAGE_ALL_ROLES, MANAGE_ALL_USERS],
  editAllScopes: [MANAGE_ALL_ROLES],
});
