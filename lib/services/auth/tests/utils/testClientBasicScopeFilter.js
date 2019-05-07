import * as assert from 'assert';
import getModelScopeFilter
  from 'lib/services/auth/tests/utils/getModelScopeFilter';
import createClient from 'lib/services/auth/tests/utils/createClient';
import createClientToken from 'lib/services/auth/tests/utils/createClientToken';


export default (modelName, actionName, scopes, expectedScopeFilter) => {
  const client = createClient(scopes);
  const scopesStr = scopes.length === 0 ? 'no scopes' : `${scopes.join(', ')} scope`;
  const token = createClientToken(scopes);

  it(`should return the correct ${actionName} filter when using a basic client with ${scopesStr} on ${modelName}`, async () => {
    const actualScopeFilter = await getModelScopeFilter(modelName, actionName, token, undefined, client);
    assert.deepEqual(actualScopeFilter, expectedScopeFilter);
  });
};
