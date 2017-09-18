import firstValuesOf from 'ui/utils/visualisations/helpers/firstValuesOf';
import period from 'ui/utils/visualisations/projections/period';

// Combination: B C/D G.
export default ({ groupType, operator, projections = {} }) => [
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
      _id: period(groupType),
      count: {
        [operator]: '$count',
      },
      ...firstValuesOf(projections),
    },
  },
];
