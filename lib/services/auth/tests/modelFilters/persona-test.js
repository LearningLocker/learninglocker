import testGlobalModel
  from 'lib/services/auth/tests/utils/testGlobalModel';
import { MANAGE_ALL_PERSONAS } from 'lib/constants/orgScopes';

testGlobalModel({
  modelName: 'persona',
  editAllScopes: [MANAGE_ALL_PERSONAS],
});
