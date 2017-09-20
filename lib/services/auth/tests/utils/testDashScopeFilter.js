import * as assert from 'assert';
import { TEST_USER_ID } from 'lib/services/auth/tests/utils/constants';
import getModelScopeFilter from 'lib/services/auth/tests/utils/getModelScopeFilter';
import createDashToken from 'lib/services/auth/tests/utils/createDashToken';
import createUser from 'lib/services/auth/tests/utils/createUser';

const user = createUser(TEST_USER_ID);

export default (modelName, actionName, scopes, expectedScopeFilter) => {
  const scopesStr = scopes.length === 0 ? 'no scopes' : `${scopes.join(', ')} scope`;
  const token = createDashToken(scopes);

  // if (!(actionName === 'view' && scopesStr === 'all scope' && modelName === 'dashboard')) {
  //   return;
  // }

  it(`should return the correct ${actionName} filter when using ${scopesStr} on ${modelName} with ${token.tokenType}`, async () => {
    const actualScopeFilter = await getModelScopeFilter(modelName, actionName, token, user);
    assert.deepEqual(actualScopeFilter, expectedScopeFilter);
  });
};
