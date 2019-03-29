import logger from 'lib/logger';
import Dashboard from 'lib/models/dashboard';
import StatementForwarding from 'lib/models/statementForwarding';
import Visualisation from 'lib/models/visualisation';
import User from 'lib/models/user';
import Query from 'lib/models/query';

const convertVisualisations = async () => {
  const visualisations = await Visualisation.find({});

  for (const visualisation of visualisations) {
    if (!visualisation.hasBeenMigrated) {
      logger.warn(`visualisation (${visualisation._id}) has not been migrated`);
      return;
    }

    visualisation.filters = visualisation.oldFilters;
    visualisation.oldFilters = undefined;

    visualisation.axesxQuery = visualisation.oldAxesxQuery;
    visualisation.oldAxesxQuery = undefined;

    visualisation.axesyQuery = visualisation.oldAxesyQuery;
    visualisation.oldAxesyQuery = undefined;

    visualisation.hasBeenMigrated = false;
    await visualisation.save();
  }
};

const convertDashboards = async () => {
  const dashboards = await Dashboard.find({});

  for (const dashboard of dashboards) {
    if (!dashboard.hasBeenMigrated) {
      logger.warn(`dashboard (${dashboard._id}) has not been migrated`);
      return;
    }

    dashboard.shareable.forEach((shareable) => {
      shareable.filter = shareable.oldFilter;
      shareable.oldFilter = undefined;
    });

    dashboard.hasBeenMigrated = false;
    await dashboard.save();
  }
};

const convertStatementForwarding = async () => {
  const statementForwardings = await StatementForwarding.find();

  for (const statementForwarding of statementForwardings) {
    if (!statementForwarding.hasBeenMigrated) {
      logger.warn(`statementForwarding (${statementForwarding._id}) has not been migrated`);
      return;
    }

    statementForwarding.query = statementForwarding.oldQuery;
    statementForwarding.oldQuery = undefined;

    statementForwarding.hasBeenMigrated = false;
    await statementForwarding.save();
  }
};

const convertUsers = async () => {
  const users = await User.find();

  for (const user of users) {
    if (!user.hasBeenMigrated) {
      logger.warn(`user (${user._id}) has not been migrated`);
      return;
    }

    user.organisationSettings.forEach((organisationSetting) => {
      organisationSetting.filter = organisationSetting.oldFilter;
      organisationSetting.oldFilter = undefined;
    });

    user.hasBeenMigrated = false;
    await user.save();
  }
};

const convertQueries = async () => {
  const queries = await Query.find();

  for (const query of queries) {
    if (!query.hasBeenMigrated) {
      logger.warn(`query (${query._id}) has not been migrated`);
      return;
    }

    query.conditions = JSON.stringify(query.oldConditions);
    query.oldConditions = undefined;

    query.hasBeenMigrated = false;
    await query.save();
  }
};

export default async () => {
  logger.info('Convert $in/$nin to $or/$nor in queries');
  try {
    await convertVisualisations();
    await convertDashboards();
    await convertStatementForwarding();
    await convertUsers();
    await convertQueries();
    logger.info('Finish converting $in/$nin to $or/$nor in queries');
  } catch (error) {
    logger.error(error);
  }
};
