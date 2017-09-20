import * as assert from 'assert';
import { TEST_OWNER_ID } from 'lib/services/auth/tests/utils/constants';
import NoAccessError from 'lib/errors/NoAccessError';
import getModelScopeFilter from 'lib/services/auth/tests/utils/getModelScopeFilter';
import createUser from 'lib/services/auth/tests/utils/createUser';
import createUserToken from 'lib/services/auth/tests/utils/createUserToken';

const user = createUser(TEST_OWNER_ID);
const token = createUserToken(TEST_OWNER_ID);

export default (modelName, actionName) => {
  it(`should return the correct ${actionName} filter when using a owner token`, async () => {
    try {
      await getModelScopeFilter(modelName, actionName, token, user);
      assert.equal(true, false, 'Expected an error to be thrown');
    } catch (err) {
      assert.equal(err.constructor, NoAccessError);
    }
  });
};
