import * as assert from 'assert';
import { TEST_OWNER_ID } from 'lib/services/auth/tests/utils/constants';
import getModelScopeFilter
  from 'lib/services/auth/tests/utils/getModelScopeFilter';
import createOrgToken from 'lib/services/auth/tests/utils/createOrgToken';
import createUser from 'lib/services/auth/tests/utils/createUser';
import NoAccessError from 'lib/errors/NoAccessError';

const user = createUser(TEST_OWNER_ID);
const token = createOrgToken([]);

export default (modelName, actionName) => {
  it(`should return the correct ${actionName} filter when owner`, async () => {
    try {
      await getModelScopeFilter(modelName, actionName, token, user);
      assert.equal(true, false, 'Expected an error to be thrown');
    } catch (err) {
      assert.equal(err.constructor, NoAccessError);
    }
  });
};
