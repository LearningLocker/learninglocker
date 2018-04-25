// @ts-check
import { values } from 'lodash';
import getTupleDataKey from './getTupleDataKey';

/**
 * @param {{[groupId: string]: { groupId: string, name: string, firstCount: number, secondCount: number }}[]} groupedSeriesResults
 * @returns {{ [tupleDataKey: string]: string[] }}
 */
const getTupleNameDictionary = (groupedSeriesResults) => {
  return groupedSeriesResults.reduce(
    /** @param {{ [tupleDataKey: string]: string[] }} result */
    (result, groupedSeriesResult) => {
      const groupedSeriesResultValues = values(groupedSeriesResult);
      groupedSeriesResultValues.forEach((seriesResultValue) => {
        const key = getTupleDataKey(seriesResultValue.firstCount, seriesResultValue.secondCount);
        result[key] = [...(result[key] || []), seriesResultValue.name];
      })
      return result;
    }, {}
  );
};

export default getTupleNameDictionary;
