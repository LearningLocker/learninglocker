import _ from 'lodash';

const remove$dte = (value) => {
  if (_.has(value, '$dte')) return _.get(value, '$dte');
  else if (_.isArray(value)) return _.map(value, remove$dte);
  else if (_.isPlainObject(value)) return _.mapValues(value, remove$dte);
  return value;
};

export default remove$dte;
