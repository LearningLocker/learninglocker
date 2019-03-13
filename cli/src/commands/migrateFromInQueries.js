import logger from 'lib/logger';
import Dashboard from 'lib/models/dashboard';
import StatementForwarding from 'lib/models/statementForwarding';
import Visualisation from 'lib/models/visualisation';

const convertVisualisations = async () => {
  const visualisations = await Visualisation.find({});

  visualisations.forEach((visualisation) => {
    if (!visualisation.hasBeenMigrated) {
      logger.error('visualisation has not been migrated');
      throw new Error('visualisation has not been migrated');
    }

    visualisation.filters = visualisation.oldFilters;
    visualisation.oldFilters = undefined;

    visualisation.axesxQuery = visualisation.oldAxesxQuery;
    visualisation.oldAxesxQuery = undefined;

    visualisation.axesyQuery = visualisation.oldAxesyQuery;
    visualisation.oldAxesyQuery = undefined;

    visualisation.hasBeenMigrated = false;

    visualisation.save();
  });
};

const convertDashboards = async () => {
  const dashboards = await Dashboard.find({});

  dashboards.forEach((dashboard) => {
    if (!dashboard.hasBeenMigrated) {
      logger.error('dashboard has not been migrated');
      throw new Error('dashboard has not been migrated');
    }

    dashboard.shareable.forEach((shareable) => {
      shareable.filter = shareable.oldFilter;
      shareable.oldFilter = undefined;
    });

    dashboard.hasBeenMigrated = false;
    dashboard.save();
  });
}

const convertStatementForwarding = async () => {
  const statementForwardings = await StatementForwarding.find();
  statementForwardings.forEach(statementForwarding => {
    if (!statementForwarding.hasBeenMigrated) {
      logger.error('statementForwarding has not been migrated');
      throw new Error('statementForwarding has not been migrated');
    }

    statementForwarding.query = statementForwarding.oldQuery;
    statementForwarding.oldQuery = undefined;

    statementForwarding.hasBeenMigrated = false;
    statementForwarding.save();
  });
}

export default async () => {
  logger.info('Convert $in/$nin to $or/$nor in queries');
  try {
    await convertVisualisations();
    await convertDashboards();
    await convertStatementForwarding();
    logger.info('Finish converting $in/$nin to $or/$nor in queries');
  } catch (error) {
    logger.error(error);
    process.exit();
  }
};
