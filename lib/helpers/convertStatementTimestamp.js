import {
  map,
  has,
  get,
  isArray,
  isPlainObject,
  isString,
  identity,
  mapValues,
} from 'lodash';

const createFilterParser = (key, parser) => (filter) => {

  if (isArray(filter)) {
    return map(filter, createFilterParser(key, parser));
  }
  if (isPlainObject(filter)) {
    let newFilter = filter;
    if (has(newFilter, key)) {
      try {
        newFilter = parser(newFilter);
      } catch (err) {
        newFilter = filter;
      }
    }
    return mapValues(newFilter, createFilterParser(key, parser));
  }

  return filter;
};

const convertToDate = (val) => {
  try {
    return isString(val) ? new Date(val) : val;
  } catch (err) {
    return val;
  }
};

const dateParser = (mutator, oldKey, newKey) => (filter) => {
  const newFilter = filter;
  const timestampValue = get(newFilter, oldKey);
  if (isString(timestampValue)) {
    newFilter[newKey] = mutator(timestampValue);
  } else if (isPlainObject(timestampValue)) {
    newFilter[newKey] = mapValues(timestampValue, mutator);
  } else {
    newFilter[newKey] = timestampValue;
  }
  delete newFilter[oldKey];
  return newFilter;
};

const createDateParser = (oldKey, newKey, mutator) => createFilterParser(oldKey, dateParser(mutator, oldKey, newKey));

const convertMatch = (match) => {
  let parsedMatch;
  parsedMatch = createDateParser('statement.timestamp', 'timestamp', convertToDate)(match);
  parsedMatch = createDateParser('statement.stored', 'stored', convertToDate)(match);
  return parsedMatch;
};
const convertSort = (sort) => {
  let parsedMatch;
  parsedMatch = createDateParser('statement.timestamp', 'timestamp', identity)(sort);
  parsedMatch = createDateParser('statement.stored', 'stored', identity)(sort);
  return parsedMatch;
};

const convertPipeline = pipeline => pipeline.map((stage) => {
  if (has(stage, '$match')) {
    return {
      ...stage,
      $match: convertMatch(get(stage, '$match')),
    };
  }

  if (has(stage, '$sort')) {
    return {
      ...stage,
      $sort: convertSort(get(stage, '$sort')),
    };
  }

  return stage;
});

const convertStatementTimestamp = (value) => {
  if (isArray(value)) return convertPipeline(value);
  if (isPlainObject(value)) return convertMatch(value);
  return value;
};

export default convertStatementTimestamp;
