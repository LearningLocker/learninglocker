import _ from 'lodash';

const convert$dte = (value) => {
  if (_.has(value, '$dte')) return new Date(_.get(value, '$dte'));
  else if (_.isArray(value)) return _.map(value, convert$dte);
  else if (_.isPlainObject(value)) return _.mapValues(value, convert$dte);
  return value;
};

export default convert$dte;
