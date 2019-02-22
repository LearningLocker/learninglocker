import _ from 'lodash';
import { fromCursor } from 'lib/helpers/cursor';
import { FORWARDS, BACKWARDS } from 'lib/constants/addCRUDFunctions';

const sortDirectionToOperator = (direction, paginationDirection) => {
  if (paginationDirection === FORWARDS) {
    switch (direction) {
      case 1:
      case 'asc':
        return '$gt';
      case -1:
      case 'desc':
        return '$lt';
      default:
        return null;
    }
  } else if (paginationDirection === BACKWARDS) {
    switch (direction) {
      case 1:
      case 'asc':
        return '$lt';
      case -1:
      case 'desc':
        return '$gt';
      default:
        return null;
    }
  }
  return null;
};

const paginationToFilter = ({ cursor, sort, paginationDirection }) => {
  const parsedCursor = fromCursor(cursor);
  const sortConditions = _.reduce(
    sort,
    ({ oldKeys, conditions }, direction, key) => {
      const operator = sortDirectionToOperator(direction, paginationDirection);
      // { _id: 1 } >>> { _id: { $gt: 'sampleid' } }
      const latestCondition = { [key]: { [operator]: parsedCursor[key] } };
      const oldConditions = _.zipObject(
        oldKeys,
        _.map(oldKeys, oldKey => parsedCursor[oldKey])
      );
      const finalCondition = { ...oldConditions, ...latestCondition };
      return {
        oldKeys: [...oldKeys, key],
        conditions: [...conditions, finalCondition]
      };
    },
    { oldKeys: [], conditions: [] }
  );
  return { $or: sortConditions.conditions };
};

export default paginationToFilter;
