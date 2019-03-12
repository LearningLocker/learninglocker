import logger from 'lib/logger';
import Dashboard from 'lib/models/dashboard';
import Visualisation from 'lib/models/visualisation';

const convertVisualisations = async () => {
  const visualisations = await Visualisation.find({});

  visualisations.forEach((visualisation) => {
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
    dashboard.shareable.forEach((shareable) => {
      shareable.filter = shareable.oldFilter;
      shareable.oldFilter = undefined;
    });

    dashboard.hasBeenMigrated = false;
    dashboard.save();
  });
}

export default async () => {
  logger.info('Convert $in/$nin to $or/$nor in queries');
  try {
    await convertVisualisations();
    await convertDashboards();
    logger.info('Finish converting $in/$nin to $or/$nor in queries');
  } catch (error) {
    logger.error(error);
    process.exit();
  }
};
