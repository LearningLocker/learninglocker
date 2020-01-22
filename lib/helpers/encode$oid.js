import mongoose from 'mongoose';
import { isArray, isPlainObject, mapValues, map } from 'lodash';

const objectId = mongoose.Types.ObjectId;

const encode$oid = (query) => {
  if (isArray(query)) {
    return map(query, encode$oid);
  } else if (isPlainObject(query)) {
    return mapValues(query, encode$oid);
  } else if (query instanceof objectId) {
    return {
      $oid: query.toString()
    };
  }

  return query;
};

export default encode$oid;
