import { getConnection } from 'lib/connections/mongoose';
import logger from 'lib/logger';
import { update$dteTimezoneString } from 'lib/helpers/update$dteTimezone';

/**
 * Update a Visualisation filters, axesxQuery, and axesyQuery
 *
 * @param {string} newTimezone
 * @return {(visualisation: mongoose.Document) => Promise}
 */
const update$dteTimezoneInVisualisation = newTimezone => async (visualisation) => {
  // Ignore if visualisation has own timezone
  if (visualisation.timezone) {
    return;
  }
  try {
    const newFilters = visualisation.filters.reduce((acc, filter) => {
      const newFilter = update$dteTimezoneString(filter, newTimezone);
      return acc.concat(newFilter);
    }, []);
    const newAxesxQuery = update$dteTimezoneString(visualisation.axesxQuery, newTimezone);
    const newAxesyQuery = update$dteTimezoneString(visualisation.axesyQuery, newTimezone);

    visualisation.filters = newFilters;
    visualisation.axesxQuery = newAxesxQuery;
    visualisation.axesyQuery = newAxesyQuery;

    await visualisation.save();
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Update an organisation's Visualisation filters, axesxQuery, and axesyQuery
 *
 * @param {mongoose.Types.ObjectId} orgId
 * @param {string} newTimezone
 * @return {Promise}
 */
const update$dteTimezoneInVisualisations = async (orgId, newTimezone) => {
  const Visualisation = getConnection().model('Visualisation');
  const visualisations = await Visualisation.find({ organisation: orgId });
  const update = update$dteTimezoneInVisualisation(newTimezone);
  const promises = visualisations.map(update);
  return Promise.all(promises);
};

/**
 * Update a StatementForwarding query
 *
 * @param {string} newTimezone
 * @return {(statementForwarding: mongoose.Document) => Promise}
 */
const update$dteTimezoneInStatementForwarding = newTimezone => async (statementForwarding) => {
  // Ignore if statementForwarding has own timezone
  if (statementForwarding.timezone) {
    return;
  }
  try {
    const newQuery = update$dteTimezoneString(statementForwarding.query, newTimezone);
    statementForwarding.query = newQuery;
    await statementForwarding.save();
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Update an organisation's StatementForwardings queries
 *
 * @param {mongoose.Types.ObjectId} orgId
 * @param {string} newTimezone
 * @return {Promise}
 */
const update$dteTimezoneInStatementForwardings = async (orgId, newTimezone) => {
  const StatementForwarding = getConnection().model('StatementForwarding');
  const statementForwardings = await StatementForwarding.find({ organisation: orgId });
  const update = update$dteTimezoneInStatementForwarding(newTimezone);
  const promises = statementForwardings.map(update);
  return Promise.all(promises);
};

/**
 * Update a Dashboard shareable filters
 *
 * @param {string} newTimezone
 * @return {(dashboard: mongoose.Document) => Promise}
 */
const update$dteTimezoneInDashboard = newTimezone => async (dashboard) => {
  try {
    dashboard.shareable.forEach((shareable) => {
      // Ignore if shareable has own timezone
      if (shareable.timezone) {
        return;
      }
      const newFilter = update$dteTimezoneString(shareable.filter, newTimezone);
      shareable.filter = newFilter;
    });

    await dashboard.save();
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Update an organisation's Dashboard shareable filters
 *
 * @param {mongoose.Types.ObjectId} orgId
 * @param {string} newTimezone
 * @return {Promise}
 */
const update$dteTimezoneInDashboards = async (orgId, newTimezone) => {
  const Dashboard = getConnection().model('Dashboard');
  const dashboards = await Dashboard.find({ organisation: orgId });
  const update = update$dteTimezoneInDashboard(newTimezone);
  const promises = dashboards.map(update);
  return Promise.all(promises);
};

/**
 * Update a User organisationSetting filter
 *
 * @param {mongoose.Types.ObjectId} orgId
 * @param {string} newTimezone
 * @return {(user: mongoose.Document) => Promise}
 */
const update$dteTimezoneInUser = (orgId, newTimezone) => async (user) => {
  try {
    user.organisationSettings.forEach((organisationSetting) => {
      // Ignore if organisationSetting has own timezone
      if (organisationSetting.timezone) {
        return;
      }
      // Ignore if organisationSetting's organisation is not target
      if (organisationSetting.organisation.toString() !== orgId.toString()) {
        return;
      }
      const newFilter = update$dteTimezoneString(organisationSetting.filter, newTimezone);
      organisationSetting.filter = newFilter;
    });

    await user.save();
  } catch (e) {
    logger.error(e);
  }
};

/**
 * Update an organisation's User organisationSettings filters
 *
 * @param {mongoose.Types.ObjectId} orgId
 * @param {string} newTimezone
 * @return {Promise}
 */
const update$dteTimezoneInUsers = async (orgId, newTimezone) => {
  const User = getConnection().model('User');
  const users = await User.find({ 'organisationSettings.organisation': orgId });
  const update = update$dteTimezoneInUser(orgId, newTimezone);
  const promises = users.map(update);
  return Promise.all(promises);
};

/**
 * Update $dte timezone of an organisation
 *
 * @param {mongoose.Types.ObjectId} orgId
 * @param {string} newTimezone
 * @return {Promise}
 */
export const update$dteTimezoneInDB = async (orgId, newTimezone) => {
  try {
    await Promise.all([
      update$dteTimezoneInStatementForwardings(orgId, newTimezone),
      update$dteTimezoneInDashboards(orgId, newTimezone),
      update$dteTimezoneInUsers(orgId, newTimezone),
      update$dteTimezoneInVisualisations(orgId, newTimezone),
    ]);
  } catch (e) {
    logger.error(e);
  }
};

export default update$dteTimezoneInDB;
