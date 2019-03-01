import { fromCursor } from 'lib/helpers/cursor';
import { reduce, map, zipObject } from 'lodash';
import { FORWARDS, BACKWARDS } from 'lib/constants/addCRUDFunctions';

const getOperator = (op, inclusive) => {
  if (!inclusive) {
    return op;
  }
  return `${op}e`;
};

const sortDirectionToOperator = (direction, paginationDirection, inclusive) => {
  if (paginationDirection === FORWARDS) {
    switch (direction) {
      case 1:
      case 'asc':
        return getOperator('$gt', inclusive);
      case -1:
      case 'desc':
        return getOperator('$lt', inclusive);
      default:
        return null;
    }
  } else if (paginationDirection === BACKWARDS) {
    switch (direction) {
      case 1:
      case 'asc':
        return getOperator('$lt', inclusive);
      case -1:
      case 'desc':
        return getOperator('$gt', inclusive);
      default:
        return null;
    }
  }
  return null;
};

const paginationToFilter = ({
  cursor,
  inclusive,
  sort,
  paginationDirection
}) => {
  const parsedCursor = fromCursor(cursor);
  const sortConditions = reduce(
    sort,
    ({ oldKeys, conditions }, direction, key) => {
      const operator = sortDirectionToOperator(
        direction,
        paginationDirection,
        inclusive
      );
      // { _id: 1 } >>> { _id: { $gt: 'sampleid' } }
      const latestCondition = { [key]: { [operator]: parsedCursor[key] } };
      const oldConditions = zipObject(
        oldKeys,
        map(oldKeys, oldKey => parsedCursor[oldKey])
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
