import { expect } from 'chai';
import { fromJS } from 'immutable';
import { update$dteTimezone } from 'lib/helpers/update$dteTimezone';

describe('helpers/update$dteTimezone', () => {
  it('should update timezone offset of $dte sub query', () => {
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

    // offset of America/La_Paz is "-04:00" and no DST
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

    expect(actual.getIn(['$and', 2, 'stored', '$timestamp', '$dte'])).to.equal('2019-02-19T00:00-04:00');
    expect(actual.getIn(['$and', 3, 'timestamp', '$timestamp', '$dte'])).to.equal('2016-11-04T00:00-04:00');
    expect(actual.equals(expected)).to.equal(true);
  });

  it('should update timezone offset of $dte sub query when second argument is offset', () => {
    const query = fromJS({
      $and: [
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

    const actual = update$dteTimezone(query, '-05:00');

    const expected = fromJS({
      $and: [
        {
          timestamp: {
            $timestamp: {
              $dte: '2016-11-04T00:00-05:00'
            },
          },
          $comment: '{"criterionLabel":"D","criteriaPath":["timestamp"]}',
        }
      ]
    });

    expect(actual.getIn(['$and', 0, 'timestamp', '$timestamp', '$dte'])).to.equal('2016-11-04T00:00-05:00');
    expect(actual.equals(expected)).to.equal(true);
  });

  it('update timezone reflects DST', () => {
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
              $dte: '2018-03-25T00:00'
            },
          },
          $comment: '{"criterionLabel":"C","criteriaPath":["stored"]}',
        },
        {
          timestamp: {
            $timestamp: {
              $dte: '2018-03-26T00:00'
            },
          },
          $comment: '{"criterionLabel":"D","criteriaPath":["timestamp"]}',
        }
      ]
    });

    // Europe/London changed to DST at 01:00 on 25 March
    const actual = update$dteTimezone(query, 'Europe/London');

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
              $dte: '2018-03-25T00:00+00:00'
            },
          },
          $comment: '{"criterionLabel":"C","criteriaPath":["stored"]}',
        },
        {
          timestamp: {
            $timestamp: {
              $dte: '2018-03-26T00:00+01:00'
            },
          },
          $comment: '{"criterionLabel":"D","criteriaPath":["timestamp"]}',
        }
      ]
    });

    expect(actual.getIn(['$and', 2, 'stored', '$timestamp', '$dte'])).to.equal('2018-03-25T00:00+00:00');
    expect(actual.getIn(['$and', 3, 'timestamp', '$timestamp', '$dte'])).to.equal('2018-03-26T00:00+01:00');
    expect(actual.equals(expected)).to.equal(true);
  });
});
