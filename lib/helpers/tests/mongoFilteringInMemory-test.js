import { expect } from 'chai';
import mongoFilteringInMemory from '../mongoFilteringInMemory';
import testStatement from './__fixtures__/testStatement';

describe('mongoFilteringInMemory', () => {
  it('should match statement', () => {
    const query = {
      $and: [
        {
          $comment: '{"criterionLabel":"A","criteriaPath":["statement","verb"]}',
          $or: [
            {
              'statement.verb.id': 'http://adlnet.gov/expapi/verbs/commented'
            }
          ]
        }
      ]
    };

    expect(
      mongoFilteringInMemory(query)(testStatement)
    ).to.equal(true);
  });

  it('should not match', () => {
    const query = {
      $and: [
        {
          $comment: '{"criterionLabel":"A","criteriaPath":["statement","verb"]}',
          $or: [
            {
              'statement.verb.id': 'http://adlnet.gov/expapi/verbs/failed'
            }
          ]
        }
      ]
    };

    expect(
      mongoFilteringInMemory(query)(testStatement)
    ).to.equal(false);
  });

  it('should match empty filter', () => {
    expect(
      mongoFilteringInMemory({})(testStatement)
    ).to.equal(true);
  });
});
