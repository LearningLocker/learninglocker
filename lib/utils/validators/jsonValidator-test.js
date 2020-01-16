import { expect } from 'chai';
import { isKeyedJSONString } from './jsonValidator';

describe('jsonValidator', () => {
  describe('isKeyedJSONString', () => {
    it('should return true', () => {
      expect(isKeyedJSONString('{}')).to.equal(true);
      expect(isKeyedJSONString('{"a":1}')).to.equal(true);
      expect(isKeyedJSONString('{"b":{"ba":true,"bc":null},"c":[false,3,"a",[]]}')).to.equal(true);
    });

    it('should return false', () => {
      expect(isKeyedJSONString('[]')).to.equal(false);
      expect(isKeyedJSONString('{a:1}')).to.equal(false);
      expect(isKeyedJSONString({})).to.equal(false);
    });
  });
});
