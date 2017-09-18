import firstValuesOf from 'ui/utils/visualisations/helpers/firstValuesOf';

// Combination: A/B C/D E.
export default ({ projections = {} }) => [
  {
    $group: {
      _id: {
        group: '$group',
        value: '$value',
      },
      ...firstValuesOf(projections),
    },
  },
  {
    $group: {
      _id: '$_id.group',
      count: {
        $sum: 1,
      },
      ...firstValuesOf(projections),
    },
  },
];
