// @ts-check

/**
 * @param {{[groupId: string]: { groupId: string, name: string }}[]} groupedSeriesResults
 * @returns {{ [groupId: string]: string }}
 */
const getValueGroupDictionary = (groupedSeriesResults) => {
  return groupedSeriesResults.reduce(
    /** @param {{ [groupId: string]: string }} result */
    (result, groupedSeriesResult) => {
      const groupIds = Object.keys(groupedSeriesResult);
      groupIds.forEach((groupId) => {
        const { name } = groupedSeriesResult[groupId];
        result[groupId] = name;
      })
      return result;
    }, {}
  );
};

export default getValueGroupDictionary;
