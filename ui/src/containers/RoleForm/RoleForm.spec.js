import { groupScopes } from './index.js';

describe('RoleForm', () => {
  it('Should group roles', () => {
    const result = groupScopes();
    expect(result[''][0]).toEqual('all');
    expect(result['org/all/statementForwarding'][0]).toEqual('org/all/statementForwarding/view');
  });
});
