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

const getCriteriaFromQuery = (query, criteria) => {
  // console.log('001 queries.getCriteriaFromQuery', query, criteria);
  const out = getMemoizedCriteria(new Map({ query, criteria }));
  return out;
};

/**
 * @param {immutable.Map|immutable.List|immutable.Set|any} query
 * @returns {immutable.Map}
 */
export const getCriteria = query =>
  getCriteriaFromQuery(query, new Map());

export const changeCriteria = (criteria) => {
  const out = new Map(
    criteria.count() > 0 ?
    { $and: criteria.toList() } :
    {}
  );
  return out;
};

export const deleteCriterion = (criteria, key) => {
  console.log('101 deleteCriterion');
  console.log('101.1 criteria', criteria);
  console.log('101.2 key', key);
  console.trace();
  const out = changeCriteria(criteria.delete(key));

  console.log('101.3 out', out);
  return out;
};

const changeCriterion = (criteria, criterionKey, newCriterion) => {
  const out = changeCriteria(criteria.set(criterionKey, newCriterion));
  return out;
};

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
  const filteredCriteria = criteria.filter((criterion) => {
    const out = new List(JSON.parse(criterion.get('$comment')).criteriaPath).equals(keyPath);
    return out;
  });

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
  const operator = getOperatorFromOrCriterion(criterion);
  const tokens = criterion.get(operator, new List());
  const newTokens = tokens.has(token) ? tokens : tokens.push(token);
  const newOrCriterion = criterion.set(operator, newTokens);
  return changeCriterion(criteria, criterionKey, newOrCriterion);
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

export const addCriterionFromSection = (query, criterion, section) => {
  const out = addCriterion(query, section.get('keyPath', new List()), criterion);
  return out;
};

const getOperatorFromOrCriterion = criterion => (criterion.has('$nor') ? '$nor' : '$or');

const getValueFromCriterion = criterion => criterion.get(getOperatorFromOrCriterion(criterion), new List());

/**
 * finds all criteria matching keyPath and operator in criteria
 */
const findMatchingCriteria = (criteria, keyPath, operator) =>
  criteria.filter((criterion, criterionKey) => {
    const criterionKeyPath = criterionKey.get('criteriaPath');
    const criterionOperator = getOperatorFromOrCriterion(criterion);
    return criterionKeyPath.equals(keyPath) && operator === criterionOperator;
  });

const mergeCriterion = (criterionA, criterionB) => {
  if (!criterionA) return criterionB;
  if (!criterionB) return criterionA;

  const operatorA = getOperatorFromOrCriterion(criterionA);
  const operatorB = getOperatorFromOrCriterion(criterionB);

  const valueA = criterionA.get(operatorA);
  const valueB = criterionB.get(operatorB);
  const newValue = new Set(valueA.concat(valueB)).toList();

  return criterionA.set(operatorA, newValue);
};

/**
 * Merges two queries
 * @param {Map} query1
 * @param {Map} query2
 */
export const mergeQueries = (query1, query2) => {
  // extract all criteria from each query
  const criteria1 = getCriteria(query1);
  const criteria2 = getCriteria(query2);

  const merged = criteria2.reduce(
    (allCriteria, criterion, criterionKey) => {
      const keyPath = criterionKey.get('criteriaPath');
      const operator = getOperatorFromOrCriterion(criterion);

      const matchingCriteria = findMatchingCriteria(allCriteria, keyPath, operator);
      const matchingCriterion = matchingCriteria.first();
      const matchingCriterionKey = matchingCriteria.keySeq().first();
      const newCriterion = mergeCriterion(matchingCriterion, criterion);
      const newCriterionKey = matchingCriterionKey || criterionKey;

      return allCriteria.set(newCriterionKey, newCriterion);
    },
    criteria1
  );

  // create a new query by merging in the remainer of each original query
  // apply the fields from each query
  return changeCriteria(merged);
};

const plural = (size) => {
  if (size === 1) {
    return '';
  }
  return 's';
};

const criterionToString = (criterion, criterionKey) =>
  `${criterionKey.get('criteriaPath').join('.')} (${getValueFromCriterion(criterion).size} item${plural(getValueFromCriterion(criterion).size)})`;

/**
 * Returns a human readable representation of a query
 * @param {Map} query
 */
export const queryToString = (query, {
  join = true
}) => {
  const criteria = getCriteria(query);
  const output = criteria.reduce((description, criterion, criterionKey) =>
    description.push(criterionToString(criterion, criterionKey))
  , new List());
  if (join) {
    return output.join(' - ');
  }
  return output;
};
