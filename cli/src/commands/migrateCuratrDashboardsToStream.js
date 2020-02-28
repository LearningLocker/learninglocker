import logger from 'lib/logger';
import Dashboard from 'lib/models/dashboard';

export const renameCuratrDashboardsToStream = async () => {
  try {
    const dashboards = await Dashboard.find(
      {
        title: { $regex: 'Curatr', $options: 'g' }
      }
    );

    for (const dashboard of dashboards) {
      dashboard.title = dashboard.title.replace('Curatr', 'Stream');

      await dashboard.save();
    }
  } catch (error) {
    logger.error(error);
  }
};

export const renameStreamDashboardsToCuratr = async () => {
  try {
    const dashboards = await Dashboard.find(
      {
        title: { $regex: 'Stream', $options: 'g' }
      }
    );

    for (const dashboard of dashboards) {
      dashboard.title = dashboard.title.replace('Stream', 'Curatr');

      await dashboard.save();
    }
  } catch (error) {
    logger.error(error);
  }
};
