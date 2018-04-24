// @ts-check
import { has } from 'lodash';
import getSeriesDataKey from './getSeriesDataKey';

/**
 * @param {{ [groupId: string]: string }} groupDictionary
 * @param {{[groupId: string]: { groupId: string, name: string, firstCount: number, secondCount: number }}[]} groupedSeriesResults
 * @returns {{ groupId: string, seriesResults: { firstCount: number, secondCount: number }[] }[]}
 */
const getTupleDataEntries = (groupDictionary, groupedSeriesResults) => {
  return Object.keys(groupDictionary).map((groupId) => {
    const seriesResults = groupedSeriesResults.map((groupedSeriesResult) => {
      const hasGroupInSeries = has(groupedSeriesResult, groupId);
      const firstCount = hasGroupInSeries ? groupedSeriesResult[groupId].firstCount : 0;
      const secondCount = hasGroupInSeries ? groupedSeriesResult[groupId].secondCount : 0;
      return { firstCount, secondCount };
    });
    return { groupId, seriesResults };
  });
};

export default getTupleDataEntries;
