import buildPeriodGroupKey from 'ui/utils/visualisations/helpers/buildPeriodGroupKey';
import firstValuesOf from 'ui/utils/visualisations/helpers/firstValuesOf';

// Combination: B C/D G.
export default ({ groupType, operator, projections = {}, timezone }) => [
  {
    $group: {
      _id: '$date',
      count: {
        $sum: 1,
      },
      ...firstValuesOf(projections),
    },
  },
  {
    $group: {
      _id: buildPeriodGroupKey(groupType, timezone),
      count: {
        [operator]: '$count',
      },
      ...firstValuesOf(projections),
    },
  },
];
