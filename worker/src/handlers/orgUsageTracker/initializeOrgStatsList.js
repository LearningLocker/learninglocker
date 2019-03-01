import { Statement } from 'lib/models';

/**
 * Build initialized orgStats list from organisation list
 *
 * @async
 * @param {lib/models/Organisation[]} organisations
 * @returns {Promise<Object[]>} initialized orgStats list
 */
export default async (organisations) => {
  const runDate = (new Date()).toISOString();

  const totalStatements = await Statement.count();

  const orgStatsList = await organisations.reduce(async (accP, org) => {
    const acc = await accP;

    const ownCount = await Statement
      .find({ organisation: org._id }, { _id: 0, organisation: 1 })
      .hint({ organisation: 1, timestamp: -1, _id: 1 })
      .count();

    const totalPercentage = totalStatements > 0 ? 100 * ownCount / totalStatements : 0;

    const orgStats = {
      organisation: org.id,
      name: org.get('name'),
      date: runDate,
      totalPercentage,
      children: [],
      finished: false,
      avgObjSizes: [],
      acceptableTries: 0,
      ownCount,
      ownEstimatedBytes: 0,
      totalCount: 0,
      totalEstimatedBytes: 0
    };

    const parent = org.get('parent');
    if (parent) {
      orgStats.parentOrganisation = parent.toString();
    }

    return [...acc, orgStats];
  }, Promise.resolve([]));

  return orgStatsList;
};
