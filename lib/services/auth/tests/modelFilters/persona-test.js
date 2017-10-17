import testShareableModel
  from 'lib/services/auth/tests/utils/testShareableModel';
import { MANAGE_ALL_PERSONAS } from 'lib/constants/orgScopes';

testShareableModel({
  modelName: 'persona',
  editAllScope: MANAGE_ALL_PERSONAS,
});
