import _ from 'lodash';

export const remove$oid = (value) => {
  if (_.has(value, '$oid')) {
    try {
      return _.get(value, '$oid');
    } catch (err) {
      return _.get(value, '$oid');
    }
  } else if (_.isArray(value)) {
    return _.map(value, remove$oid);
  } else if (_.isPlainObject(value)) {
    return _.mapValues(value, remove$oid);
  }

  return value;
};

export default remove$oid;
