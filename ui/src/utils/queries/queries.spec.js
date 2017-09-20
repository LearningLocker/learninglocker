import { fromJS } from 'immutable';
import { mergeQueries } from './index';


test('Merge query into empty query', () => {
  const query1 = fromJS({});
  const query2 = fromJS({
    $and: [
      {
        $or: [
          { 'person._id': { $oid: '5942905ea563926886f4aeeb' } }
        ],
        $comment: '{"criterionLabel":"A","criteriaPath":["person"]}'
      },
      {
        $or: [{
          'statement.verb.id': 'http://activitystrea.ms/schema/1.0/join'
        }],
        $comment: '{"criterionLabel":"B","criteriaPath":["statement","verb"]}'
      }
    ]
  });

  const result = mergeQueries(query1, query2);

  expect(result.getIn(['$and', 0, '$or', 0, 'person._id', '$oid'])).toEqual('5942905ea563926886f4aeeb');
  expect(result.getIn(['$and', 1, '$or', 0, 'statement.verb.id'])).toEqual('http://activitystrea.ms/schema/1.0/join');
});


test('Merge two queries', () => {
  const query1 = fromJS({
    $and: [
      {
        $or: [
          { 'person._id': { $oid: '5942905ea563926886f4aeeb' } }
        ],
        $comment: '{"criterionLabel":"A","criteriaPath":["person"]}'
      },
      {
        $or: [{
          'statement.verb.id': 'http://activitystrea.ms/schema/1.0/somethingelse'
        }],
        $comment: '{"criterionLabel":"B","criteriaPath":["statement","verb"]}'
      }
    ]
  });
  const query2 = fromJS({
    $and: [
      {
        $or: [
          { 'person._id': { $oid: '5942905ea563926886f4aeeb' } }
        ],
        $comment: '{"criterionLabel":"A","criteriaPath":["person"]}'
      },
      {
        $or: [{
          'statement.verb.id': 'http://activitystrea.ms/schema/1.0/join'
        }],
        $comment: '{"criterionLabel":"B","criteriaPath":["statement","verb"]}'
      }
    ]
  });

  const result = mergeQueries(query1, query2);

  expect(result.getIn(['$and', 0, '$or', 0, 'person._id', '$oid'])).toEqual('5942905ea563926886f4aeeb');
  expect(result.getIn(['$and', 1, '$or', 0, 'statement.verb.id'])).toEqual('http://activitystrea.ms/schema/1.0/somethingelse');
  expect(result.getIn(['$and', 1, '$or', 1, 'statement.verb.id'])).toEqual('http://activitystrea.ms/schema/1.0/join');
});
