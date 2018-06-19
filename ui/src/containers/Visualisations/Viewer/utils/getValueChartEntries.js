// @ts-check
import getSeriesDataKey from './getSeriesDataKey';

/**
 * @param {{ [groupId: string]: string }} groupDictionary
 * @param {{[groupId: string]: { groupId: string, name: string, count: number }}[]} groupedSeriesResults
 * @returns [{ groupId, total, s0, s1, ... }]
 */
const getValueChartEntries = (groupDictionary, groupedSeriesResults) => {
  return Object.keys(groupDictionary).map((groupId) => {
    return groupedSeriesResults.reduce((chartDataEntry, groupedSeriesResult, index) => {
      const groupResult = groupedSeriesResult[groupId];
      const value = groupResult !== undefined ? groupResult.count : 0
      chartDataEntry[getSeriesDataKey(index)] = value;
      chartDataEntry.total += value;
      return chartDataEntry;
    }, { groupId, total: 0 });
  });
};

export default getValueChartEntries;
