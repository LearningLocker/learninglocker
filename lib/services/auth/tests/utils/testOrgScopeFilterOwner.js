import * as assert from 'assert';
import { TEST_OWNER_ID } from 'lib/services/auth/tests/utils/constants';
import getModelScopeFilter from 'lib/services/auth/tests/utils/getModelScopeFilter';
import createOrgToken from 'lib/services/auth/tests/utils/createOrgToken';
import createUser from 'lib/services/auth/tests/utils/createUser';

const user = createUser(TEST_OWNER_ID);
const token = createOrgToken([]);

export default (modelName, actionName, expectedScopeFilter) => {
  // if (!(actionName === 'delete' && modelName === 'dashboard')) {
  //   return;
  // }

  it(`should return the correct ${actionName} filter when owner on ${modelName}`, async () => {
    const actualScopeFilter = await getModelScopeFilter(modelName, actionName, token, user);
    assert.deepEqual(actualScopeFilter, expectedScopeFilter);
  });
};
