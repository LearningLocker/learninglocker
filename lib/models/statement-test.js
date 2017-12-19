import { get } from 'lodash';
import { expect } from 'chai';
import Statement from './statement';


describe('statement', () => {
  it('should replace &46 with .', () => {
    const result = Statement.postFetchMap({
      statement: {
        'test&46;com': {
          'test2&46;com': 'test'
        }
      }
    });

    expect(get(result, ['statement', 'test.com', 'test2.com'])).to.equal('test');
  });
});
