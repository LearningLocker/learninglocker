import { fromJS } from 'immutable';
import firstValuesOf from 'ui/utils/visualisations/helpers/firstValuesOf';

// Combination: I J E.
export default ({ projections = {} }) => fromJS([
  {
    $group: {
      _id: null,
      count: {
        $sum: 1,
      },
      ...firstValuesOf(projections),
    },
  },
]);
