import firstValuesOf from 'ui/utils/visualisations/helpers/firstValuesOf';

// Combination: A/B C F.
export default ({ operator, projections = {} }) => [
  {
    $group: {
      _id: '$group',
      count: {
        [operator]: '$value',
      },
      ...firstValuesOf(projections),
    },
  },
];
