import { Statement } from 'lib/models';

/**
 * Build initialized orgStats list from organisation list
 *
 * @async
 * @param {lib/models/Organisation[]} organisations
 * @returns {Promise<Object[]>} initialized orgStats list
 */
export default async (organisations) => {
  const isoDate = (new Date()).toISOString();

  const aggregated = await Statement
    .aggregate([
      { $group: { _id: '$organisation', count: { $sum: 1 } } }
    ])
    .hint({ organisation: 1, timestamp: -1, _id: 1 })
    .allowDiskUse(true)
    .exec();

  const statementCounts = aggregated.reduce((acc, r) => ({ ...acc, [r._id.toString()]: r.count }), {});
  const totalStatements = aggregated.reduce((acc, r) => acc + r.count, 0);

  return organisations.reduce((acc, org) => {
    const ownCount = statementCounts[org.id] || 0;
    const totalPercentage = totalStatements > 0 ? 100 * ownCount / totalStatements : 0;

    const orgStats = {
      organisation: org.id,
      name: org.get('name'),
      date: isoDate,
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
};
