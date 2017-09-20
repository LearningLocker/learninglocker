import Statement from 'lib/models/statement';
import {
  flatten,
  has,
  head,
  clone,
  isArray,
  isString,
  isEmpty,
  isObject,
  isUndefined,
  get,
  set,
  map,
  each,
  reject,
  merge,
  tail,
  takeWhile
} from 'lodash';

export const matchArrays = (needle = [], hay = []) => {
  // if both arrays are empty
  if (isEmpty(needle) && isEmpty(hay)) return true;
  let hasMatch = false;
  // while there are more elements in the needle
  takeWhile(hay, (hayPath, index) => {
    const needlePath = needle[index];

    if (isUndefined(hayPath)) {
      // if the element in hayPath is not set return false
      hasMatch = false;
    } else if (hayPath === '*') {
      // if the element in hayPath is * return true, stop the loop
      hasMatch = true; return false;
    } else {
      // return true if it matches the same index in hayPath
      hasMatch = (hayPath === needlePath);
    }
    return hasMatch;
  });

  return hasMatch;
};

const whitelist = [
  { searchPath: ['statement', 'authority'], filter: ['objectType', 'member', 'mbox', 'account', 'mbox_sha1sum', 'openid'], displayKey: 'name' },
  { searchPath: ['statement', 'actor'], filter: ['objectType', 'member', 'mbox', 'account', 'mbox_sha1sum', 'openid'], displayKey: 'name' },
  { searchPath: ['statement', 'verb'], filter: ['id'], displayKey: 'display' },
  { searchPath: ['statement', 'object'], filter: ['id'], displayKey: 'definition.name' },
  { searchPath: ['statement', 'object', 'definition', 'type'] },
  { searchPath: ['statement', 'object', 'definition', 'extensions', '*'] },
  { searchPath: ['statement', 'context', 'registration'] },
  { searchPath: ['statement', 'context', 'instructor'], filter: ['objectType', 'member', 'mbox', 'account', 'mbox_sha1sum', 'openid'], displayKey: 'name' },
  { searchPath: ['statement', 'context', 'team'], filter: ['objectType', 'member', 'mbox', 'account', 'mbox_sha1sum', 'openid'], displayKey: 'name' },
  { searchPath: ['statement', 'context', 'revision'] },
  { searchPath: ['statement', 'context', 'platform'] },
  { searchPath: ['statement', 'context', 'language'] },
  { searchPath: ['statement', 'context', 'contextActivities', 'category', '*'], filter: ['id'], displayKey: 'definition.name' },
  { searchPath: ['statement', 'context', 'contextActivities', 'grouping', '*'], filter: ['id'], displayKey: 'definition.name' },
  { searchPath: ['statement', 'context', 'contextActivities', 'parent', '*'], filter: ['id'], displayKey: 'definition.name' },
  { searchPath: ['statement', 'context', 'contextActivities', 'other', '*'], filter: ['id'], displayKey: 'definition.name' },
  { searchPath: ['statement', 'context', 'extensions', '*'] },
  { searchPath: ['statement', 'result', 'extensions', '*'] },
  // { searchPath: ['statement', 'context', 'statement'] },
];

const filterValue = (currentPath, object, filter, displayKey) => {
  let filteredObject = {};
  if (isArray(filter) && isObject(object)) {
    // if we have a filter and this is an object, returned a filtered version
    each(filter, (key) => {
      const val = get(object, key);
      if (val) set(filteredObject, key, val);
    });
  } else {
    filteredObject = object;
  }

  let display = null;
  const fullValue = clone(filteredObject);
  if (isString(displayKey) && isObject(object)) {
    const displayVal = get(object, displayKey);
    if (displayVal) {
      const displayObject = {};
      set(displayObject, displayKey, displayVal);
      display = displayVal;
      merge(fullValue, displayObject);
    }
  }
  return {
    value: filteredObject,
    path: currentPath,
    fullValue,
    display
  };
};

const getDeep = (object, currentPath = [], filter, displayKey) => {
  // if the object looks like an actor or activity (has an objectType)
  // or if it's not mappable
  // stop here and store the whole thing as a value
  const isAnArray = isArray(object);
  const isAnObject = isObject(object);
  const isMappable = isAnArray || isAnObject;
  const isActorObject = has(object, 'objectType');

  if (!isMappable || isActorObject) {
    return filterValue(currentPath, object, filter, displayKey);
  }

  // otherwise go deeper
  return flatten(map(object, (value, index) => {
    // for arrays we don't store the index in the path
    // it's not used for MongoDB queries
    // for objects we add the key
    const nextPath = isAnArray ? currentPath : [...currentPath, index];
    return getDeep(value, nextPath, filter, displayKey);
  }));
};

export const getAtPath = (object, { searchPath, filter, displayKey }, currentPath = []) => {
  // if we have found the key we are looking for
  // or if we can't go any deeper
  if (searchPath.length === 0 || !isObject(object)) {
    return filterValue(currentPath, object, filter, displayKey);
  }

  // get the current key from the left of the searchPath
  const key = head(searchPath);
  const remainingSearchPath = tail(searchPath);

  // if the key is * look in every key from the object
  if (key === '*') {
    return getDeep(object, currentPath, filter, displayKey);
  }

  return getAtPath(
    object[key],
    { searchPath: remainingSearchPath, filter, displayKey },
    [...currentPath, key]
  );
};

export default function (statement) {
  const statementData = (statement instanceof Statement) ? statement.toObject() : statement;

  const flatMap = flatten(
    map(whitelist, pathData =>
      getAtPath(statementData, pathData)
    )
  );

  const withoutMissingValues = reject(
    flatMap,
    flatPath => isUndefined(flatPath.path) || isUndefined(flatPath.value)
  );

  return withoutMissingValues;
}
