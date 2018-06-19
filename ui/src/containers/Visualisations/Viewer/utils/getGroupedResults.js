// @ts-check

/**
 * @typedef {Object} GroupResult
 * @property {string} _id
 * @property {string} model
 * @property {number} count
 */

/**
 * @param {GroupResult[]} groupResults
 * @returns {{[groupId: string]: { groupId: string, name: string, count: number }}}
 */
const getGroupedResults = (groupResults) => {
  return groupResults.reduce((groupedSeriesResult, groupResult) => {
    const { _id: groupId, model: name, count } = groupResult;
    groupedSeriesResult[groupResult._id] = { groupId, name, count };
    return groupedSeriesResult;
  }, {});
};

export default getGroupedResults;
