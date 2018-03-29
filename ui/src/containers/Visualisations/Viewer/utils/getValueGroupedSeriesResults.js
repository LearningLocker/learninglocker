// @ts-check

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
    return seriesResult.reduce((groupedSeriesResult, groupResult) => {
      const { _id: groupId, model: name, count } = groupResult;
      groupedSeriesResult[groupResult._id] = { groupId, name, count };
      return groupedSeriesResult;
    }, {});
  });
};

export default getValueGroupedSeriesResults;
