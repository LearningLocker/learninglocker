/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import mongoose from 'mongoose';
import filter$lookup from 'lib/helpers/filter$lookup';
import { cloneDeep } from 'lodash';

const objectId = mongoose.Types.ObjectId;


describe('filter$lookup helper test', () => {
  const orgId = '561a679c0c5d017e4004714f';
  const firstStages = [
    {
      $sort: {
        _id: -1
      }
    }
  ];
  const lastStages = [
    {
      $project: {
        _id: 1
      }
    }
  ];

  it('should add an organisations pipeline to an allowed collection with no existing pipeline', () => {
    const lookupStage = [
      {
        $lookup: {
          from: 'personas',
          as: 'personas',
          foreignField: '_id',
          localField: '_id',
        }
      }
    ];
    const expectedLookupStage = cloneDeep(lookupStage);
    expectedLookupStage[0].$lookup.pipeline = [
      {
        $match: {
          organisation: objectId(orgId)
        }
      },
    ];

    const result = filter$lookup([
      ...firstStages,
      ...lookupStage,
      ...lastStages
    ], orgId);
    const expectedResult = [
      ...firstStages,
      ...expectedLookupStage,
      ...lastStages
    ];
    expect(result).to.deep.equal(expectedResult);
  });

  it('should add an organisations pipeline to an allowed collection with an existing pipeline', () => {
    const lookupStage = [
      {
        $lookup: {
          from: 'personas',
          as: 'personas',
          foreignField: '_id',
          localField: '_id',
          pipeline: [
            { $match: { foo: 'bar' } },
            { $match: { hello: 'world' } },
          ]
        }
      }
    ];
    const expectedLookupStage = cloneDeep(lookupStage);
    expectedLookupStage[0].$lookup.pipeline = [
      ...[
        {
          $match: {
            organisation: objectId(orgId)
          }
        }
      ],
      ...expectedLookupStage[0].$lookup.pipeline
    ];

    const result = filter$lookup([
      ...firstStages,
      ...lookupStage,
      ...lastStages
    ], orgId);
    const expectedResult = [
      ...firstStages,
      ...expectedLookupStage,
      ...lastStages
    ];

    expect(result).to.deep.equal(expectedResult);
  });

  it('should filter out a $lookup when not in an allowed collection', () => {
    const lookupStage = [
      {
        $lookup: {
          from: 'users',
          as: 'users',
          foreignField: '_id',
          localField: '_id',
        }
      }
    ];
    const result = filter$lookup([
      ...firstStages,
      ...lookupStage,
      ...lastStages
    ]);
    const expectedResult = [
      ...firstStages,
      ...[],
      ...lastStages
    ];

    expect(result).to.deep.equal(expectedResult);
  });
});
