import testGlobalModel
  from 'lib/services/auth/tests/utils/testGlobalModel';
import { MANAGE_ALL_PERSONAS } from 'lib/constants/orgScopes';

testGlobalModel({
  modelName: 'persona',
  editAllScope: MANAGE_ALL_PERSONAS,
});
