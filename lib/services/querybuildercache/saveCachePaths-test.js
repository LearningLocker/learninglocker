import { expect } from 'chai';
import saveCachePaths from './saveCachePaths';

describe('saveCachePaths', () => {
  it('should save cache paths & subpaths', () => {
    const caches = [{ path: ['path0', 'path1', 'path2'] }];
    const organisation = 'organisationId';

    let mockBatchCount = 0;
    const mockBatch = {
      insert: (item) => {
        if (mockBatchCount === 2) {
          expect(item.searchString).to.equal('path0.path1.path2');
          expect(item.path).to.eql(['path0', 'path1', 'path2']);
        } else if (mockBatchCount === 1) {
          expect(item.searchString).to.equal('path0.path1');
          expect(item.path).to.eql(['path0', 'path1']);
        } else if (mockBatchCount === 0) {
          expect(item.searchString).to.equal('path0');
          expect(item.path).to.eql(['path0']);
        }
        expect(item.organisation).to.equal(organisation);

        mockBatchCount += 1;
      }
    };

    saveCachePaths(caches, organisation, mockBatch);

    expect(mockBatchCount).to.equal(3);
  });
});
