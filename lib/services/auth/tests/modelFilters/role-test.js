import testAdminModel from 'lib/services/auth/tests/utils/testAdminModel';
import { MANAGE_ALL_ROLES } from 'lib/constants/orgScopes';

testAdminModel({
  modelName: 'role',
  viewAllScope: MANAGE_ALL_ROLES,
  editAllScope: MANAGE_ALL_ROLES,
});
