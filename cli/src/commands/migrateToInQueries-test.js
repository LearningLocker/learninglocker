import { expect } from 'chai';
import { buildNewFilter } from './migrateToInQueries';

describe('migrateToInQueries', () => {
  describe('buildNewFilters', () => {
    it('should not change when $match.$and does not exist', async () => {
      const input = JSON.stringify({ $match: {} });
      const expected = JSON.stringify({ $match: {} });
      const actual = buildNewFilter(input);
      expect(actual).to.equal(expected);
    });

    it('should convert to queries using $in/$nin', async () => {
      const comment1 = JSON.stringify({
        criterionLabel: 'A',
        criteriaPath: ['statement', 'x', 'xx']
      });

      const comment2 = JSON.stringify({
        criterionLabel: 'B',
        criteriaPath: ['statement', 'y']
      });

      const comment3 = JSON.stringify({
        criterionLabel: 'C',
        criteriaPath: ['statement', 'z']
      });

      const comment4 = JSON.stringify({
        criterionLabel: 'D',
        criteriaPath: ['statement', 'z', 'zz']
      });

      const input = JSON.stringify({
        $match: {
          $and: [
            {
              $comment: comment1,
              $or: [
                { 'key.a': 'value1' },
                { 'key.a': 'value2' },
                { 'key.a': 'value3' }
              ]
            },
            {
              $comment: comment2,
              $nor: [
                { 'key.b': 'value5' },
                { 'key.b': 'value6' }
              ]
            },
            {
              $comment: comment3,
              'key.c': true
            },
            {
              $comment: comment4,
              timestamp: {
                $lt: {
                  $dte: '2057-03-20T00:00Z'
                }
              }
            }
          ]
        }
      });

      const expected = JSON.stringify({
        $match: {
          $and: [
            {
              $comment: comment1,
              'key.a': {
                $in: ['value1', 'value2', 'value3']
              }
            },
            {
              $comment: comment2,
              'key.b': {
                $nin: ['value5', 'value6']
              }
            },
            {
              $comment: comment3,
              'key.c': true
            },
            {
              $comment: comment4,
              timestamp: {
                $lt: {
                  $dte: '2057-03-20T00:00Z'
                }
              }
            }
          ]
        }
      });

      const actual = buildNewFilter(input);
      expect(actual).to.equal(expected);
    });

    it('should not convert queries matching actors', async () => {
      const actorComment = JSON.stringify({
        criterionLabel: 'A',
        criteriaPath: ['statement', 'actor']
      });

      const nonActorComment = JSON.stringify({
        criterionLabel: 'B',
        criteriaPath: ['statement', 'object', 'definition', 'type']
      });

      const input = JSON.stringify({
        $match: {
          $and: [
            {
              $comment: actorComment,
              $or: [
                { 'key.a': 'value1' },
                { 'key.a': 'value2', 'key.c': 'value3' },
                { 'key.a': 'value4' }
              ]
            },
            {
              $comment: nonActorComment,
              $nor: [
                { 'key.b': 'value5' },
                { 'key.b': 'value6' }
              ]
            }
          ]
        }
      });

      const expected = JSON.stringify({
        $match: {
          $and: [
            {
              $comment: actorComment,
              $or: [
                { 'key.a': 'value1' },
                { 'key.a': 'value2', 'key.c': 'value3' },
                { 'key.a': 'value4' }
              ]
            },
            {
              $comment: nonActorComment,
              'key.b': {
                $nin: ['value5', 'value6']
              }
            }
          ]
        }
      });

      const actual = buildNewFilter(input);
      expect(actual).to.equal(expected);
    });
  });
});
