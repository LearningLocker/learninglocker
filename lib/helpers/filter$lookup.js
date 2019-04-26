import {
  isPlainObject,
  reject,
  isArray,
  get,
  includes,
  has,
  map,
  omitBy,
  mapValues
} from 'lodash';

const ALLOWED_LOOKUPS = [
  'personas',
  'personaIdentifiers',
  'personaAttributes',
  'journeys',
  'journeyprogresses'
];

const shouldRemove = (value, key) => {
  if (key === '$lookup') {
    value = {
      $lookup: value
    };
  }

  if (!isPlainObject(value)) {
    return false;
  }
  if (!has(value, '$lookup')) {
    return false;
  }

  if (!has(value, ['$lookup', 'from'])) {
    return true;
  }

  if (
    includes(ALLOWED_LOOKUPS, get(value, ['$lookup', 'from']))
  ) {
    return false;
  }
  return true;
};

const filter$lookup = (value) => {
  let nextValue = value;

  if (isArray(nextValue)) {
    nextValue = reject(nextValue, shouldRemove);

    return map(nextValue, filter$lookup);
  }

  if (isPlainObject(nextValue)) {
    nextValue = omitBy(nextValue, shouldRemove);

    return mapValues(nextValue, filter$lookup);
  }

  return value;
};

export default filter$lookup;
