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
  'journeyprogresses',
  'statements',
];

const shouldRemove = (value, key) => {
  return (
    _.has(value, ['$lookup', 'from']) &&
    includes(ALLOWED_LOOKUPS, get(value, ['$lookup', 'from']))
  );
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
