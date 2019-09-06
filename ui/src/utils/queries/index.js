/* eslint-disable no-use-before-define */
import { Map, List, Set } from 'immutable';
import { memoize } from 'lodash';

const incrementLetter = letter =>
  String.fromCharCode(letter.charCodeAt(0) + 1);

const incrementLabel = (label) => {
  const init = label.slice(0, -1);
  const last = label[label.length - 1];
  if (last === 'Z') return `${incrementLabel(init)}A`;
  if (last === undefined) return 'A';
  return init + incrementLetter(last);
};

const getNextLabel = (criteria) => {
  const labels = criteria.map((criterion, criterionKey) =>
    criterionKey.get('criterionLabel')
  ).toList().sort();
  const lastLabel = labels.last() || '';
  return incrementLabel(lastLabel);
};

/**
 * @param {immutable.Map} map
 * @param {immutable.Map} criteria
 * @returns {immutable.Map}
 */
const getCriterionFromOldComment = (map, criteria) => {
  const comment = map.get('$comment');
  const criteriaKey = new Map({
    criterionLabel: getNextLabel(criteria),
    criteriaPath: new List(comment.split('.')),
  });
  const criteriaMap = map.set('$comment', JSON.stringify(criteriaKey));
  return criteria.set(criteriaKey, criteriaMap);
};

/**
 * @param {immutable.Map} map
 * @param {immutable.Map} criteria
 * @returns {immutable.Map}
 */
const getCriterionFromNewComment = (map, criteria) => {
  const comment = JSON.parse(map.get('$comment'));
  const criteriaKey = new Map({
    criterionLabel: comment.criterionLabel,
    criteriaPath: new List(comment.criteriaPath),
  });
  return criteria.set(criteriaKey, map);
};

/**
 * @param {immutable.Map} map
 * @param {immutable.Map} criteria
 * @returns {immutable.Map}
 */
const getCriterionFromComment = (map, criteria) => {
  const comment = map.get('$comment');
  if (comment[0] !== '{') {
    return getCriterionFromOldComment(map, criteria);
  }
  return getCriterionFromNewComment(map, criteria);
};

const getCriteriaFromList = (list, criteria) =>
  list.reduce((result, queryValue) => (
    getCriteriaFromQuery(queryValue, result)
  ), criteria);

const getCriteriaFromMap = (map, criteria) => {
  const keys = map.keySeq();
  if (keys.includes('$comment')) {
    return getCriterionFromComment(map, criteria);
  }
  return keys.reduce((result, key) => (
    getCriteriaFromQuery(map.get(key), result)
  ), criteria);
};

/**
 * @param {immutable.Map} args - {
 *   query: immutable.Map|immutable.List|immutable.Set|any
 *   criteria: immutable.Map
 * }
 * @returns {immutable.Map}
 */
const getMemoizedCriteria = memoize((args) => {
  const query = args.get('query');
  const criteria = args.get('criteria');
  if (query instanceof Map) {
    return getCriteriaFromMap(query, criteria);
  }
  if (query instanceof List) {
    return getCriteriaFromList(query, criteria);
  }
  if (query instanceof Set) {
    return getCriteriaFromList(query, criteria);
  }
  return new Map();
}, iterable =>
  /*
  iterable.hashCode();
  Doesn't work due to immutable hashCode ignoring decimable places. and hashCode is not guaranteed to be unique
  see: https://github.com/facebook/immutable-js/issues/266 (if it ever get's released)
  */
  iterable.toJS()
);

/**
 * @param {immutable.Map|immutable.List|immutable.Set|any} query
 * @param {immutable.Map} criteria
 * @returns {immutable.Map}
 */
const getCriteriaFromQuery = (query, criteria) => getMemoizedCriteria(new Map({ query, criteria }));

/**
 * @param {immutable.Map|immutable.List|immutable.Set|any} query
 * @returns {immutable.Map}
 */
export const getCriteria = query =>
  getCriteriaFromQuery(query, new Map());

export const changeCriteria = criteria =>
  new Map(
    criteria.count() > 0 ?
    { $and: criteria.toList() } :
    {}
  );

export const deleteCriterion = (criteria, key) => changeCriteria(criteria.delete(key));

const changeCriterion = (criteria, criterionKey, newCriterion) =>
  changeCriteria(criteria.set(criterionKey, newCriterion));

/**
 * Judge whether the keyPath should use $in criterion
 *
 * false means should use $or criterion
 *
 * @param {immutable.List} keyPath
 * @return {boolean}
 */
const shouldUseInCriterion = keyPath =>
  keyPath.equals(new List(['person'])) ||
  keyPath.equals(new List(['statement', 'verb'])) ||
  keyPath.equals(new List(['statement', 'object']));

/**
 * @param {immutable.Map} query
 * @param {immutable.List} keyPath
 * @param {immutable.Map} token
 * @return {immutable.Map}
 */
export const addTokenToQuery = (query, keyPath, token) => {
  const criteria = getCriteria(query);
  const filteredCriteria = criteria.filter(criterion =>
    new List(JSON.parse(criterion.get('$comment')).criteriaPath).equals(keyPath)
  );

  if (shouldUseInCriterion(keyPath)) {
    const [tokenKey, tokenValue] = token.entrySeq().first();

    // Add new $in criterion
    if (filteredCriteria.size === 0) {
      return addCriterion(query, keyPath, new Map({
        [tokenKey]: new Map({
          $in: new List([tokenValue]),
        }),
      }));
    }

    // Add tokenValue to exiting $in criterion
    const op = filteredCriteria.first().get(tokenKey).has('$in') ? '$in' : '$nin';
    const inCriterionKey = filteredCriteria.keyOf(filteredCriteria.first());
    const tokenValues = filteredCriteria.first().getIn([tokenKey, op]);
    const newTokenValues = tokenValues.has(tokenValue) ? tokenValues : tokenValues.push(tokenValue);
    const newInCriterion = filteredCriteria.first().setIn([tokenKey, op], newTokenValues);
    return changeCriterion(criteria, inCriterionKey, newInCriterion);
  }

  // Add new $or criterion
  if (filteredCriteria.size === 0) {
    return addCriterion(query, keyPath, new Map({
      $or: new List([token]),
    }));
  }

  // Add token to exiting $or criterion
  const criterion = filteredCriteria.first();
  const criterionKey = filteredCriteria.keyOf(criterion);
  const operator = getOperatorFrom$orCriterion(criterion);
  const tokens = criterion.get(operator, new List());
  const newTokens = tokens.has(token) ? tokens : tokens.push(token);
  const new$orCriterion = criterion.set(operator, newTokens);
  return changeCriterion(criteria, criterionKey, new$orCriterion);
};

/**
 * @param {immutable.Map} query
 * @param {immutable.List} keyPath
 * @param {immutable.Map} criterion
 * @return {immutable.Map}
 */
const addCriterion = (query, keyPath, criterion) => {
  const criteria = getCriteria(query);
  const criterionKey = new Map({
    criterionLabel: getNextLabel(criteria),
    criteriaPath: keyPath,
  });
  const newCriterion = criterion.merge({
    $comment: JSON.stringify(criterionKey),
  });
  return changeCriterion(criteria, criterionKey, newCriterion);
};

export const addCriterionFromSection = (query, criterion, section) =>
  addCriterion(query, section.get('keyPath', new List()), criterion);

/**
 * returns whether the criterion is $or / $nor type criterion
 *
 * @param {immutable.Map} criterion
 * @returns {boolean}
 */
const is$orCriterion = criterion => Map.isMap(criterion) && (criterion.has('$nor') || criterion.has('$or'));

const is$inCriterion = (criterion) => {
  const queryKey = criterion.keySeq().last();
  const query = criterion.get(queryKey);
  return Map.isMap(criterion) && Map.isMap(query) && (query.has('$nin') || query.has('$in'));
};

const isDiscreteCriterion = criterion => is$orCriterion(criterion) || is$inCriterion(criterion);

/**
 * @param {immutable.Map} criterion
 * @returns {string} - '$or'|'$nor'
 */
const getOperatorFrom$orCriterion = criterion => (criterion.has('$nor') ? '$nor' : '$or');

/**
 * @param {immutable.Map} criterion
 * @returns {string} - '$nin'|'$in'
 */
const getOperatorFrom$inCriterion = (criterion) => {
  const queryKey = criterion.keySeq().last();
  return criterion.hasIn([queryKey, '$nin']) ? '$nin' : '$in';
};

const getValueFrom$orCriterion = criterion => criterion.get(getOperatorFrom$orCriterion(criterion), new List());

const getValueFrom$inCriterion = (criterion) => {
  const queryKey = criterion.keySeq().last();
  const op = getOperatorFrom$inCriterion(criterion);
  return criterion.getIn([queryKey, op], new List());
};

const plural = (size) => {
  if (size === 1) {
    return '';
  }
  return 's';
};

const countValues = (criterion) => {
  if (is$orCriterion(criterion)) {
    return getValueFrom$orCriterion(criterion).size;
  }
  return getValueFrom$inCriterion(criterion).size;
};

/**
 * @param {} criterion
 * @param {} criterionKey
 * @returns {string}
 */
const criterionToString = (criterion, criterionKey) => {
  const criteriaPathString = criterionKey.get('criteriaPath').join('.');

  if (isDiscreteCriterion(criterion)) {
    const size = countValues(criterion);
    return `${criteriaPathString} (${size} item${plural(size)})`;
  }

  return criteriaPathString;
};

/**
 * Returns a human readable representation of a query
 * @param {immutable.Map} query
 * @returns {immutable.List<string>}
 */
export const queryToStringList = (query) => {
  const criteria = getCriteria(query);
  const output = criteria.reduce((description, criterion, criterionKey) =>
    description.push(criterionToString(criterion, criterionKey))
  , new List());
  return output;
};
