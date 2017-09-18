const map = {
  count: '$sum',
  average: '$avg',
  max: '$max',
  min: '$min',
  uniqueCount: '$sum',
  uniqueAverage: '$avg',
  uniqueMax: '$max',
  uniqueMin: '$min',
};

export default op => map[op];
