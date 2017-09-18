import testGlobalModel from 'lib/services/auth/tests/utils/testGlobalModel';
import { MANAGE_ALL_ROLES } from 'lib/constants/orgScopes';

testGlobalModel({
  modelName: 'role',
  editAllScope: MANAGE_ALL_ROLES,
});
