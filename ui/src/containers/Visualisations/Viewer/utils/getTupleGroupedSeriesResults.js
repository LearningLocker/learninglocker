// @ts-check
import { union, has } from 'lodash';
import getGroupedResults from './getGroupedResults';

/**
 * @typedef {Object} GroupResult
 * @property {string} _id
 * @property {string} model
 * @property {number} count
 */

/**
 * @param {GroupResult[][][]} seriesResults
 * @returns {{[groupId: string]: { groupId: string, name: string, firstCount: number, secondCount: number }}[]}
 */
const getTupleGroupedSeriesResults = (seriesResults) => {
  return seriesResults.map((seriesResult) => {
    const firstValueResults = getGroupedResults(seriesResult[0]);
    const secondValueResults = getGroupedResults(seriesResult[1]);
    const groups = union(Object.keys(firstValueResults), Object.keys(secondValueResults));
    return groups.reduce((result, groupId) => {
      const hasFirstValue = has(firstValueResults, groupId);
      const hasSecondValue = has(secondValueResults, groupId);
      const name = hasFirstValue ? firstValueResults[groupId].name : secondValueResults[groupId].name;
      const firstCount = hasFirstValue ? firstValueResults[groupId].count : 0;
      const secondCount = hasSecondValue ? secondValueResults[groupId].count : 0;
      result[groupId] = { groupId, name, firstCount, secondCount };
      return result;
    }, {});
  });
};

export default getTupleGroupedSeriesResults;
