import { fromJS } from 'immutable';
import firstValuesOf from 'ui/utils/visualisations/helpers/firstValuesOf';

// Combination: I C F.
export default ({ operator, projections = {} }) => fromJS([
  {
    $group: {
      _id: null,
      count: {
        [operator]: '$value',
      },
      ...firstValuesOf(projections),
    },
  },
]);
