/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import convertStatementTimestamp from 'lib/helpers/convertStatementTimestamp';

describe('convertStatementTimestamp helper test', () => {
  const arrayPipeline = [
    {
      $match: {
        'statement.timestamp': {
          $gte: { $dte: '2017-01-01' },
          $lt: '2018-01-01T00:00:00',
        },
        $and: [
          {
            $comment: 'statement.stored.A',
            $or: [
              {
                'statement.stored': '-123'
              }
            ]
          },
          {
            $comment: 'statement.stored.B',
            $or: [
              {
                'statement.stored': { $dte: '2018-01-01' }
              }
            ]
          },
          {
            $comment: 'statement.timestamp.C',
            $or: [
              {
                'statement.timestamp': '2019-01-01'
              }
            ]
          },
        ]
      }
    },
    {
      $sort: {
        'statement.timestamp': -1
      }
    },
    {
      $project: {
        'statement.timestamp': 1
      }
    }
  ];

  const expectedArrayPipeline = [
    {
      $match: {
        timestamp: {
          $gte: { $dte: '2017-01-01' },
          $lt: new Date('2018-01-01T00:00:00'),
        },
        $and: [
          {
            $comment: 'statement.stored.A',
            $or: [
              {
                stored: new Date('-123')
              }
            ]
          },
          {
            $comment: 'statement.stored.B',
            $or: [
              {
                stored: { $dte: new Date('2018-01-01') }
              }
            ]
          },
          {
            $comment: 'statement.timestamp.C',
            $or: [
              {
                timestamp: new Date('2019-01-01')
              }
            ]
          },
        ]
      }
    },
    {
      $sort: {
        timestamp: -1
      }
    },
    {
      $project: {
        'statement.timestamp': 1
      }
    }
  ];

  const pipeline = {
    'statement.timestamp': '2017-01-01'
  };
  const expectedPipeline = {
    timestamp: new Date(pipeline['statement.timestamp'])
  };

  it('should parse the pipeline when its an array', () => {
    const result = convertStatementTimestamp(arrayPipeline);
    expect(result).to.deep.equal(expectedArrayPipeline);
  });

  it('should parse the pipeline when its an object', () => {
    const result = convertStatementTimestamp(pipeline);
    expect(result).to.deep.equal(expectedPipeline);
  });
});
