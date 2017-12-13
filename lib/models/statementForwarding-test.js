import { expect } from 'chai';
import { AUTH_TYPE_TOKEN } from 'lib/constants/statementForwarding';
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

  describe('maxRetries validation', () => {
    it('Should validate maxRetries', () => {
      const statementForwarding = new StatementForwarding({
        configuration: {
          maxRetries: 1001
        }
      });
      const result = statementForwarding.validateSync();

      expect(result.errors['configuration.maxRetries'].message).to.equal(
        'Path `configuration.maxRetries` (1001) is more than maximum allowed value (10).'
      );
    });
  });

  describe('headers validation', () => {
    it('auth type and Authorisation headers cannot both be set', () => {
      const statementForwarding = new StatementForwarding({
        configuration: {
          authType: AUTH_TYPE_TOKEN,
          headers: '{"Authorization": "test"}'
        }
      });
      const result = statementForwarding.validateSync();

      expect(result.errors['configuration.authType'].message).to.equal(
        'Headers already contains an Authorisation header'
      );

      expect(result.errors['configuration.headers'].message).to.equal(
        'Header can not contain Authorisation if Authorisation is set'
      );
    });

    it('Should be valid http header', () => {
      const statementForwarding = new StatementForwarding({
        configuration: {
          headers: '{"test fail": "test"}'
        }
      });

      const result = statementForwarding.validateSync();

      expect(result.errors['configuration.headers'].message).to.equal(
        'Not valid http headers'
      );
    });

    it('Should not allow reserved headers', () => {
      const statementForwarding = new StatementForwarding({
        configuration: {
          headers: '{"Content-Length": "49"}'
        }
      });

      const result = statementForwarding.validateSync();

      expect(result.errors['configuration.headers'].message).to.equal(
        'Headers can not contain Content-Type or Content-Length'
      );
    });
  });
});
