/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { cloneDeep } from 'lodash';
import mongoose from 'mongoose';
import filter$lookup from 'lib/helpers/filter$lookup';
import createDummyOrgAuthInfo from 'lib/helpers/createDummyOrgAuthInfo';

const objectId = mongoose.Types.ObjectId;

describe('filter$lookup helper test', async () => {
  const orgId = '561a679c0c5d017e4004714f';
  const authInfo = createDummyOrgAuthInfo(orgId);
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

  it('should add an organisations pipeline to an allowed collection with no existing pipeline', async () => {
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

    const result = await filter$lookup([
      ...firstStages,
      ...lookupStage,
      ...lastStages
    ], authInfo);
    const expectedResult = [
      ...firstStages,
      ...expectedLookupStage,
      ...lastStages
    ];
    expect(result).to.deep.equal(expectedResult);
  });

  it('should add an organisations pipeline to an allowed collection with an existing pipeline', async () => {
    const lookupStage = [
      {
        $lookup: {
          from: 'personas',
          as: 'personas',
          foreignField: '_id',
          localField: '_id',
          pipeline: [
            { $match: { foo: 'bar' } },
            { $lookup: { from: 'users' } },
            { $match: { hello: 'world' } },
            {
              $lookup: {
                from: 'statements',
                pipeline: [
                  { $match: { foo: 'bar' } }
                ]
              }
            },
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
      { $match: { foo: 'bar' } },
      { $match: { hello: 'world' } },
      {
        $lookup: {
          from: 'statements',
          pipeline: [
            {
              $match: {
                organisation: objectId(orgId)
              }
            },
            { $match: { foo: 'bar' } }
          ]
        }
      },
    ];

    const result = await filter$lookup([
      ...firstStages,
      ...lookupStage,
      ...lastStages
    ], authInfo);
    const expectedResult = [
      ...firstStages,
      ...expectedLookupStage,
      ...lastStages
    ];

    expect(result).to.deep.equal(expectedResult);
  });

  it('should filter out a $lookup when not in an allowed collection', async () => {
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
    const result = await filter$lookup([
      ...firstStages,
      ...lookupStage,
      ...lastStages
    ], authInfo);
    const expectedResult = [
      ...firstStages,
      ...[],
      ...lastStages
    ];

    expect(result).to.deep.equal(expectedResult);
  });
});
