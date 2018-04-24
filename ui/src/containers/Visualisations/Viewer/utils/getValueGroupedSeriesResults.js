// @ts-check
import getGroupedResults from './getGroupedResults';

/**
 * @typedef {Object} GroupResult
 * @property {string} _id
 * @property {string} model
 * @property {number} count
 */

/**
 * @param {GroupResult[][]} seriesResults
 * @returns {{[groupId: string]: { groupId: string, name: string, count: number }}[]}
 */
const getValueGroupedSeriesResults = (seriesResults) => {
  return seriesResults.map((seriesResult) => {
    return getGroupedResults(seriesResult);
  });
};

export default getValueGroupedSeriesResults;
