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

const getCriterionFromOldComment = (map, criteria) => {
  const comment = map.get('$comment');
  const criteriaKey = new Map({
    criterionLabel: getNextLabel(criteria),
    criteriaPath: new List(comment.split('.')),
  });
  const criteriaMap = map.set('$comment', JSON.stringify(criteriaKey));
  return criteria.set(criteriaKey, criteriaMap);
};

const getCriterionFromNewComment = (map, criteria) => {
  const comment = JSON.parse(map.get('$comment'));
  const criteriaKey = new Map({
    criterionLabel: comment.criterionLabel,
    criteriaPath: new List(comment.criteriaPath),
  });
  return criteria.set(criteriaKey, map);
};

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

const getCriteriaFromQuery = (query, criteria) => getMemoizedCriteria(new Map({ query, criteria }));

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

export const addTokenToQuery = (query, keyPath, token) => {
  const criteria = getCriteria(query);
  const filteredCriteria = criteria.filter(criterion =>
    new List(JSON.parse(criterion.get('$comment')).criteriaPath).equals(keyPath)
  );

  if (filteredCriteria.size === 0) {
    return addCriterion(query, keyPath, new Map({
      $or: new List([token])
    }));
  }

  const criterion = filteredCriteria.first();
  const criterionKey = filteredCriteria.keyOf(criterion);
  const operator = getOperatorFromCriterion(criterion);
  const tokens = criterion.get(operator, new List());
  const tokenExists = tokens.filter(t => token.equals(t)).size !== 0;
  const newTokens = tokenExists ? tokens : tokens.push(token);
  const newCriterion = criterion.set(operator, newTokens);
  return changeCriterion(criteria, criterionKey, newCriterion);
};

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

const getOperatorFromCriterion = criterion => (criterion.has('$nor') ? '$nor' : '$or');

const getValueFromCriterion = criterion => criterion.get(getOperatorFromCriterion(criterion), new List());

/**
 * finds all criteria matching keyPath and operator in criteria
 */
const findMatchingCriteria = (criteria, keyPath, operator) =>
  criteria.filter((criterion, criterionKey) => {
    const criterionKeyPath = criterionKey.get('criteriaPath');
    const criterionOperator = getOperatorFromCriterion(criterion);
    return criterionKeyPath.equals(keyPath) && operator === criterionOperator;
  });

const mergeCriterion = (criterionA, criterionB) => {
  if (!criterionA) return criterionB;
  if (!criterionB) return criterionA;

  const operatorA = getOperatorFromCriterion(criterionA);
  const operatorB = getOperatorFromCriterion(criterionB);

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
      const operator = getOperatorFromCriterion(criterion);

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


const criterionToString = (criterion, criterionKey) =>
  `${criterionKey.get('criteriaPath').join('.')} ${getValueFromCriterion(criterion).size} items`;

/**
 * Returns a human readable representation of a query
 * @param {Map} query
 */
export const queryToString = (query) => {
  const criteria = getCriteria(query);
  const output = criteria.reduce((description, criterion, criterionKey) =>
    description.push(criterionToString(criterion, criterionKey))
  , new List());
  return output.join(' - ');
};
