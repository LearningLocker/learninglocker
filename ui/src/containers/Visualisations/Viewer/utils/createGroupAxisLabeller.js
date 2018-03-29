// @ts-check

/**
 * @param {{ [groupId: string ]: string }} groupDictionary
 * @returns {(groupId: string) => string}
 */
const createGroupAxisLabeller = (groupDictionary) => {
  return (groupId) => {
    const name = groupDictionary[groupId];
    return name !== undefined ? name : groupId;
  };
};

export default createGroupAxisLabeller;
