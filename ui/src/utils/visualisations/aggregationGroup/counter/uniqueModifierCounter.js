import { fromJS } from 'immutable';
import firstValuesOf from 'ui/utils/visualisations/helpers/firstValuesOf';

// Combination: A/B J G.
export default ({ operator, projections = {} }) => fromJS([
  {
    $group: {
      _id: '$group',
      count: {
        $sum: 1,
      },
      ...firstValuesOf(projections),
    },
  },
  {
    $group: {
      _id: null,
      count: {
        [operator]: '$count',
      },
      ...firstValuesOf(projections),
    },
  },
]);
