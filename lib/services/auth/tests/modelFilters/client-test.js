import testGlobalModel from 'lib/services/auth/tests/utils/testGlobalModel';
import { MANAGE_ALL_CLIENTS } from 'lib/constants/orgScopes';

testGlobalModel({
  modelName: 'client',
  editAllScope: MANAGE_ALL_CLIENTS,
});
