/* eslint-disable no-use-before-define */
import * as lodash from 'lodash';

const eq = expected => actual => actual === expected;
const oid = expected => actual => actual.toString() === expected;
const gt = expected => actual => actual > expected;
const gte = expected => actual => actual >= expected;
const lt = expected => actual => actual < expected;
const lte = expected => actual => actual <= expected;
const ne = expected => actual => actual !== expected;
const regex = expected => actual => (new RegExp(expected)).test(actual);
const exists = expected => actual => !(lodash.isNull(actual) || lodash.isUndefined(actual)) === expected;
const contains = expected => actual => lodash.includes(expected, actual);
const nin = expected => actual => !contains(expected)(actual);
const or = conditions => actual => (match(conditions[0])(actual) ||
  (conditions.length > 1 ? or(conditions.slice(1))(actual) : false));
const and = conditions => actual => (match(conditions[0])(actual) &&
  (conditions.length > 1 ? and(conditions.slice(1))(actual) : true));
const not = condition => actual => !match(condition)(actual);
const nor = conditions => actual => (not(conditions[0])(actual) &&
  (conditions.length > 1 ? nor(conditions.slice(1))(actual) : true));

const matchKey = (key, value) => (actual) => {
  switch (key) {
    case '$eq':
    case '=':
      return eq(value)(actual);
    case '$oid':
      return oid(value)(actual);
    case '$ne':
    case '!=':
      return ne(value)(actual);
    case '$gt':
    case '>':
      return gt(value)(actual);
    case '$gte':
    case '>=':
      return gte(value)(actual);
    case '$lt':
    case '<':
      return lt(value)(actual);
    case '$lte':
    case '<=':
      return lte(value)(actual);
    case '$regex':
    case '~':
      return regex(value)(actual);
    case '$in':
      return contains(value)(actual);
    case '$nin':
      return nin(value)(actual);
    case '$or':
      return or(value)(actual);
    case '$and':
      return and(value)(actual);
    case '$not':
      return not(value)(actual);
    case '$nor':
      return nor(value)(actual);
    case '$exists':
      return exists(value)(actual);
    case '$comment':
      return true;
    default:
      if (key[0] === '$') { throw new Error(`invalid key ${key}`); }
      if (key.indexOf('extensions.') === 0) {
        const keys = key.split('.');
        if (keys.length !== 2) { throw new Error(`Bad extension key ${key}`); }
        return lodash.get(actual, keys) === value;
      }
      if (lodash.isObject(value)) {
        return match(value)(lodash.get(actual, key));
      }
      return eq(value)(actual[key]);
  }
};

const matchKeys = (keys, filter) => actual =>
  keys.length === 0 || (
    matchKey(keys[0], filter[keys[0]])(actual) &&
    (keys.length > 1 ? matchKeys(keys.slice(1), filter)(actual) : true)
  );

const match = filter => actual => matchKeys(Object.keys(filter), filter)(actual);

export default match;
