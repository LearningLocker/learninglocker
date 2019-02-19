import { fromJS } from 'immutable';
import update$dteTimezone from './update$dteTimezone';

test('update timezone offset of $dte sub query', () => {
  const query = fromJS({
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
      },
      {
        stored: {
          $timestamp: {
            $dte: '2019-02-19T00:00+13:00'
          },
        },
        $comment: '{"criterionLabel":"C","criteriaPath":["stored"]}',
      },
      {
        timestamp: {
          $timestamp: {
            $dte: '2016-11-04T00:00-07:30'
          },
        },
        $comment: '{"criterionLabel":"D","criteriaPath":["timestamp"]}',
      }
    ]
  });

  // offset of America/La_Paz is "-04:00"
  const actual = update$dteTimezone(query, 'America/La_Paz');

  const expected = fromJS({
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
      },
      {
        stored: {
          $timestamp: {
            $dte: '2019-02-19T00:00-04:00'
          },
        },
        $comment: '{"criterionLabel":"C","criteriaPath":["stored"]}',
      },
      {
        timestamp: {
          $timestamp: {
            $dte: '2016-11-04T00:00-04:00'
          },
        },
        $comment: '{"criterionLabel":"D","criteriaPath":["timestamp"]}',
      }
    ]
  });

  expect(actual.getIn(['$and', 2, 'stored', '$timestamp', '$dte'])).toEqual('2019-02-19T00:00-04:00');
  expect(actual.getIn(['$and', 3, 'timestamp', '$timestamp', '$dte'])).toEqual('2016-11-04T00:00-04:00');
  expect(actual.equals(expected)).toEqual(true);
});
