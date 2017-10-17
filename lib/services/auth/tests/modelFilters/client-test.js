import testAdminModel from 'lib/services/auth/tests/utils/testAdminModel';
import { MANAGE_ALL_CLIENTS } from 'lib/constants/orgScopes';

testAdminModel({
  modelName: 'client',
  viewAllScope: MANAGE_ALL_CLIENTS,
  editAllScope: MANAGE_ALL_CLIENTS,
});
