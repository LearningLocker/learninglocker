import _ from 'lodash';
import mongoose from 'mongoose';

const objectId = mongoose.Types.ObjectId;

const convert$oid = (value) => {
  if (_.has(value, '$oid')) {
    try {
      return objectId(_.get(value, '$oid'));
    } catch (err) {
      return _.get(value, '$oid');
    }
  } else if (_.isArray(value)) {
    return _.map(value, convert$oid);
  } else if (_.isPlainObject(value)) {
    return _.mapValues(value, convert$oid);
  }

  return value;
};

export default convert$oid;
