import { bind } from 'lodash';
import { expect } from 'chai';
import { postFetchMap } from '../addCRUDFunctions';

describe('addCRUDFunctions', () => {
  it('should apply postFetchMap', () => {
    let called = 0;
    const mockPostFetchMap = () => {
      called += 1;
    };
    const context = {
      postFetchMap: mockPostFetchMap
    };

    bind(postFetchMap, context)({});


    expect(called).to.equal(1);
  });

  it('should apply postFetchMap to an array', () => {
    let called = 0;
    const mockPostFetchMap = () => {
      called += 1;
    };
    const context = {
      postFetchMap: mockPostFetchMap
    };

    postFetchMap.bind(context)([{}, {}]);

    expect(called).to.equal(2);
  });
});
