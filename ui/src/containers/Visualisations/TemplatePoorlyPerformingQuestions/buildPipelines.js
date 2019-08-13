import { List, fromJS } from 'immutable';

/**
 * @param {immutable.List} preReqs - pre-built pipeline
 * @returns {immutable.List<immutable.List>} - pipeline list
 */
const buildPipelines = (preReqs) => {
  const pipeline = fromJS([
    {
      $match: {
        'statement.result.score.scaled': { $exists: true },
      },
    },
    {
      $project: {
        group: '$statement.object.id',
        scaledScore: '$statement.result.score.scaled',
        model: {
          objectType: '$statement.object.objectType',
          id: '$statement.object.id',
          definition: {
            name: '$statement.object.definition.name',
          },
        }
      }
    },
    {
      $group: {
        _id: '$group',
        attempts: { $sum: 1 },
        avgScaledScore: { $avg: '$scaledScore' },
        model: { $first: '$model' },
      },
    },
    {
      $sort: { avgScaledScore: 1 },
    },
    {
      $limit: 10000,
    },
    {
      $project: {
        _id: 1,
        attempts: 1,
        avgScaledScore: 1,
        model: 1,
      },
    },
  ]);
  const finalPipeline = preReqs.concat(pipeline);
  return new List([finalPipeline]);
};

export default buildPipelines;
