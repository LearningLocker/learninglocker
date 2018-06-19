// @ts-check

/**
 * @param {{ [groupId: string ]: string }} groupDictionary
 * @returns {(groupId: string) => string}
 */
const createGroupTooltipLabeller = (groupDictionary) => {
  return (groupId) => {
    const name = groupDictionary[groupId];
    return name !== undefined ? name : groupId;
  };
};

export default createGroupTooltipLabeller;
