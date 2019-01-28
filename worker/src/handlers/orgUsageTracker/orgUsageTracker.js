import mongoose from 'mongoose';
import logger from 'lib/logger';
import { Organisation, OrgUsageStats, Statement, StatementSample, StatementOrgSample } from 'lib/models';
import initializeOrgStatsList from './initializeOrgStatsList';
import totalUsage from './totalUsage';

const objectId = mongoose.Types.ObjectId;

const SAMPLE_SIZE = 10000;
const MIN_SAMPLES = 5;
const MAX_SAMPLES = 10;
const ACCEPTABLE_SAMPLE_THRESHOLD_PERCENTAGE = 5;

const runSample = async (orgStatsList) => {
  // Sampling
  await Statement
    .aggregate([
      { $sample: { size: SAMPLE_SIZE } },
      { $out: 'statementSamples' }
    ])
    .allowDiskUse(true)
    .exec();

  const totalSampleCount = await StatementSample.count();

  for (const orgStats of orgStatsList) {
    if (!orgStats.finished) {
      await StatementSample
        .aggregate([
          { $match: { organisation: objectId(orgStats.organisation) } },
          { $out: 'statementOrgSamples' }
        ])
        .exec();
      const stats = await StatementOrgSample.collection.stats();

      orgStats.avgObjSizes.push(stats.avgObjSize || 0);

      const orgSampleCount = await Statement
        .find({ organisation: orgStats.organisation }, { _id: 0, organisation: 1 })
        .count();

      const orgSamplePercentage = 100 * orgSampleCount / totalSampleCount;
      if (orgSamplePercentage >= orgStats.totalPercentage - ACCEPTABLE_SAMPLE_THRESHOLD_PERCENTAGE) {
        orgStats.acceptableTries += 1;
      }

      if (orgStats.acceptableTries >= MIN_SAMPLES || orgStats.avgObjSizes.length >= MAX_SAMPLES) {
        const avgOfAvgObjSizes = orgStats.avgObjSizes.reduce((a, b) => a + b, 0) / orgStats.avgObjSizes.length;
        orgStats.ownEstimatedBytes = Math.round(avgOfAvgObjSizes * orgStats.ownCount);
        orgStats.finished = true;
      }
    }
  }
};

/**
 * Update orgStats of organisations
 *
 * @async
 * @param {lib/models/Organisation[]} organisations
 * @param {Object[]} orgStatsList - orgStats list
 */
const saveOrganisationsWithUsageStats = async (organisations, orgStatsList) => {
  const orgStatsDict = orgStatsList.reduce(
    (acc, s) => ({ ...acc, [s.organisation]: s }),
    {}
  );

  for (const organisation of organisations) {
    const usageStats = orgStatsDict[organisation.id];
    try {
      organisation.set('usageStats.RUN_DATETIME', usageStats.date);
      organisation.set('usageStats.HAS_CHILDREN', usageStats.children.length > 0);
      organisation.set('usageStats.OWN_COUNT', usageStats.ownCount);
      organisation.set('usageStats.OWN_ESTIMATED_BYTES', usageStats.ownEstimatedBytes);
      organisation.set('usageStats.TOTAL_COUNT', usageStats.totalCount);
      organisation.set('usageStats.TOTAL_ESTIMATED_BYTES', usageStats.totalEstimatedBytes);
      await organisation.save();
    } catch (err) {
      logger.error(err);
    }
  }
};

export default async (_, jobDone) => {
  logger.info('Start orgUsageTracker');
  try {
    const organisations = await Organisation.find({}).exec();
    const orgStatsList = await initializeOrgStatsList(organisations);

    let totalRunSamples = 0;
    while (!orgStatsList.every(o => o.finished)) {
      if (totalRunSamples > MAX_SAMPLES) {
        throw new Error('totalRunSamples is unexpectedly over MAX_SAMPLES');
      }
      await runSample(orgStatsList);
      totalRunSamples += 1;
    }
    logger.info(`Ran ${totalRunSamples} samples`);

    const withTotalUsage = totalUsage(orgStatsList);

    // Save usage stats data
    await saveOrganisationsWithUsageStats(organisations, withTotalUsage);
    await OrgUsageStats.create(withTotalUsage);

    // Drop temporary collections
    await StatementSample.collection.drop();
    await StatementOrgSample.collection.drop();
  } catch (err) {
    logger.error(err);
  }
  logger.info('End orgUsageTracker');
  jobDone();
};
