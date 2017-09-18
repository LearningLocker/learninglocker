import * as assert from 'assert';
import NoAccessError from 'lib/errors/NoAccessError';
import { TEST_USER_ID } from 'lib/services/auth/tests/utils/constants';
import getModelScopeFilter from 'lib/services/auth/tests/utils/getModelScopeFilter';
import createOrgToken from 'lib/services/auth/tests/utils/createOrgToken';
import createUser from 'lib/services/auth/tests/utils/createUser';

const user = createUser(TEST_USER_ID);

export default (modelName, actionName, scopes) => {
  const scopesStr = scopes.length === 0 ? 'no scopes' : `${scopes.join(', ')} scope`;
  const token = createOrgToken(scopes);

  it(`should throw error for ${actionName} filter when using ${scopesStr}`, async () => {
    try {
      await getModelScopeFilter(modelName, actionName, token, user);
      assert.equal(true, false, 'Expected an error to be thrown');
    } catch (err) {
      assert.equal(err.constructor, NoAccessError);
    }
  });
};
