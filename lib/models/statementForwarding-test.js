import { expect } from 'chai';
import StatementForwarding from './statementForwarding';

describe('statementForwarding', () => {
  it('getAuthHeaders with token', () => {
    const statementForwarding = new StatementForwarding({
      configuration: {
        authType: 'token',
        secret: 'theSecretToken'
      }
    });

    const result = statementForwarding.getAuthHeaders();

    expect(result.toJS().Authorization).to.equal('Bearer theSecretToken');
  });

  it('getAuthHeaders with basic auth', () => {
    const statementForwarding = new StatementForwarding({
      configuration: {
        authType: 'basic auth',
        basicUsername: 'theBasicUsername',
        basicPassword: 'theBasicPassword'
      }
    });

    const result = statementForwarding.getAuthHeaders();

    expect(result.toJS().Authorization).to.equal('Basic dGhlQmFzaWNVc2VybmFtZTp0aGVCYXNpY1Bhc3N3b3Jk');
  });
});
