const toDict = orgStatsList =>
  orgStatsList.reduce((acc, orgStats) => ({
    ...acc,
    [orgStats.organisation]: {
      ...orgStats,
      totalCount: 0,
      totalEstimatedBytes: 0,
      children: []
    }
  }), {});

/**
 * Create organisation tree based on "parent" property of organisations
 *
 * @param {Object[]} orgStatsList - orgStats list
 * @returns {Object} organisation tree
 */
const toTree = (orgStatsList) => {
  const dict = toDict(orgStatsList);
  const list = Object.values(dict);
  list.forEach((orgStat) => {
    if (orgStat.parentOrganisation) {
      if (dict[orgStat.parentOrganisation]) {
        dict[orgStat.parentOrganisation].children.push(orgStat);
      } else {
        orgStat.parentOrganisation = null;
      }
    }
  });

  return {
    isRoot: true,
    children: list.filter(s => !s.parentOrganisation)
  };
};

const sumUpUsage = (node) => {
  node.totalCount = node.ownCount || 0;
  node.totalEstimatedBytes = node.ownEstimatedBytes || 0;

  node.children.forEach((child) => {
    sumUpUsage(child);
    node.totalCount += child.totalCount;
    node.totalEstimatedBytes += child.totalEstimatedBytes;
  });
};

/**
 * Convert an organisation tree to list
 *
 * @param {Object} node - node of organisation tree
 * @returns {Object[]} organisation list
 */
const serialize = node =>
  node.children.reduce(
    (acc, child) => acc.concat(serialize(child)),
    node.isRoot ? [] : [node]
  );

/**
 * Calculate total usage including child organisations
 *
 * @param {Object[]} orgStatsList - orgStats list
 * @returns {Object[]} list of orgStats with calculated total usage
 */
export default (orgStatsList) => {
  const tree = toTree(orgStatsList);
  sumUpUsage(tree);
  return serialize(tree).map(o => ({
    ...o,
    children: o.children.map(c => c.organisation)
  }));
};
