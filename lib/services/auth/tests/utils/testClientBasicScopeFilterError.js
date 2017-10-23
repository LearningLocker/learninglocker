import * as assert from 'assert';
import NoAccessError from 'lib/errors/NoAccessError';
import getModelScopeFilter from 'lib/services/auth/tests/utils/getModelScopeFilter';
import createClientToken from 'lib/services/auth/tests/utils/createClientToken';
import createClient from 'lib/services/auth/tests/utils/createClient';

const client = createClient();

export default (modelName, actionName, scopes) => {
  const scopesStr = scopes.length === 0 ? 'no scopes' : `${scopes.join(', ')} scope`;
  const token = createClientToken(scopes);

  it(`should throw error for ${actionName} filter when using basic client with ${scopesStr}`, async () => {
    try {
      await getModelScopeFilter(modelName, actionName, token, undefined, client);
      assert.equal(true, false, 'Expected an error to be thrown');
    } catch (err) {
      assert.equal(err.constructor, NoAccessError);
    }
  });
};
