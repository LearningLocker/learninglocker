import * as assert from 'assert';
import { SITE_ADMIN } from 'lib/constants/scopes';
import { TEST_OWNER_ID } from 'lib/services/auth/tests/utils/constants';
import getModelScopeFilter
  from 'lib/services/auth/tests/utils/getModelScopeFilter';
import createUserToken from 'lib/services/auth/tests/utils/createUserToken';
import createUser from 'lib/services/auth/tests/utils/createUser';
import NoAccessError from 'lib/errors/NoAccessError';

const user = createUser(TEST_OWNER_ID);
const token = createUserToken(TEST_OWNER_ID, [SITE_ADMIN]);

export default (modelName, actionName) => {
  it(`should return the correct ${actionName} filter when using a site admin token`, async () => {
    try {
      await getModelScopeFilter(modelName, actionName, token, user);
      assert.equal(true, false, 'Expected an error to be thrown');
    } catch (err) {
      assert.equal(err.constructor, NoAccessError);
    }
  });
};
