import { fromJS, Map } from 'immutable';
import lodash from 'lodash';
import logger from 'lib/logger';
import Dashboard from 'lib/models/dashboard';
import StatementForwarding from 'lib/models/statementForwarding';
import Visualisation from 'lib/models/visualisation';
import User from 'lib/models/user';
import Query from 'lib/models/query';

/**
 * @param {immutable.List} criteriaPath
 * @returns {boolean}
 */
const isActor = criteriaPath =>
  criteriaPath.length === 2
  && criteriaPath[0] === 'statement'
  && criteriaPath[1] === 'actor';

/**
 * @param {immutable.List} criteriaPath
 * @returns {boolean}
 */
const isPersonaId = criteriaPath =>
  criteriaPath.length > 2
  && criteriaPath[0] === 'persona'
  && criteriaPath[1] === 'import';

/**
 * @param {immutable.List} criteriaPath
 * @returns {boolean}
 */
const isContextInstructor = criteriaPath =>
  criteriaPath.length === 3
  && criteriaPath[0] === 'statement'
  && criteriaPath[1] === 'context'
  && criteriaPath[2] === 'instructor';

/**
 * @param {immutable.Map} condition
 * @returns {boolean}
 */
const shouldConvert = (condition) => {
  try {
    const comment = condition.get('$comment');
    const criteriaPath = JSON.parse(comment).criteriaPath || [];

    if (isActor(criteriaPath) || isPersonaId(criteriaPath) || isContextInstructor(criteriaPath)) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
};

/**
 * Convert queries on immutable object layer
 *
 * @param {immutable.Map} oldQuery
 * @returns {immutable.Map}
 */
const _buildNewQuery = (oldQuery) => {
  // some queries start with ['$match', '$and'] others do ['$and']
  const startsWithMatchAnd = oldQuery.hasIn(['$match', '$and']);
  const startsWithAnd = oldQuery.has('$and');

  if (!startsWithMatchAnd && !startsWithAnd) {
    return oldQuery;
  }

  const oldConditions = oldQuery.getIn(['$match', '$and'], oldQuery.get('$and'));

  const newConditions = oldConditions.map((condition) => {
    if (!shouldConvert(condition)) {
      return condition;
    }

    const hasOr = condition.has('$or');
    const hasNor = condition.has('$nor');

    if (!hasOr && !hasNor) {
      return condition;
    }

    const logicalOp = hasOr ? '$or' : '$nor';
    const comparisonOp = hasOr ? '$in' : '$nin';

    const expression = condition.get(logicalOp);
    const key = expression.first().keySeq().reduce((_, k) => k);
    const values = expression.map(kv => kv.get(key));

    return condition
      .delete(logicalOp)
      .set(key, new Map({ [comparisonOp]: values }));
  });

  const path = startsWithMatchAnd ? ['$match', '$and'] : ['$and'];
  return oldQuery.setIn(path, newConditions);
};

/**
 * Convert query strings
 * @param {string} oldQuery
 * @returns {string}
 */
export const buildNewQuery = (oldQuery) => {
  if (!oldQuery) {
    return oldQuery;
  }
  const immutableOldQuery = fromJS(JSON.parse(oldQuery));
  try {
    const immutableNewQuery = _buildNewQuery(immutableOldQuery);
    return JSON.stringify(immutableNewQuery.toJS());
  } catch (error) {
    throw new Error(`${error.message}: ${oldQuery}`);
  }
};

const convertVisualisations = async () => {
  const visualisations = await Visualisation.find({});

  for (const visualisation of visualisations) {
    try {
      if (visualisation.hasBeenMigrated) {
        logger.warn(`visualisation (${visualisation._id}) has been migrated`);
        return;
      }

      // filters
      const oldFilters = visualisation.filters;
      const newFilters = oldFilters.reduce((acc, oldFilter) => {
        const newFilter = buildNewQuery(oldFilter);
        return acc.concat(newFilter);
      }, []);

      // axesxQuery
      const oldAxesxQuery = visualisation.axesxQuery;
      const newAxesxQuery = buildNewQuery(oldAxesxQuery);

      // axesyQuery
      const oldAxesyQuery = visualisation.axesyQuery;
      const newAxesyQuery = buildNewQuery(oldAxesyQuery);

      // Save updated queries and log
      logger.info(`Update Visualisation (${visualisation._id})`);

      // mutate visualisation
      visualisation.oldFilters = visualisation.filters;
      visualisation.filters = newFilters;
      logger.info('convert filters');
      logger.info(oldFilters);
      logger.info(newFilters);

      visualisation.oldAxesxQuery = visualisation.axesxQuery;
      visualisation.axesxQuery = newAxesxQuery;
      logger.info('convert axesxQuery');
      logger.info(oldAxesxQuery);
      logger.info(newAxesxQuery);

      visualisation.oldAxesyQuery = visualisation.axesyQuery;
      visualisation.axesyQuery = newAxesyQuery;
      logger.info('convert axesyQuery');
      logger.info(oldAxesyQuery);
      logger.info(newAxesyQuery);

      visualisation.hasBeenMigrated = true;
      await visualisation.save();
    } catch (err) { logger.error(`Error updating Visualisation ${visualisation._id}`, err); }
  }
};

const convertDashboards = async () => {
  const dashboards = await Dashboard.find({});

  for (const dashboard of dashboards) {
    try {
      if (dashboard.hasBeenMigrated) {
        logger.warn(`dashboard (${dashboard._id}) has been migrated`);
        return;
      }

      const oldShareableList = lodash.cloneDeep(dashboard.shareable);

      // mutate shareable
      dashboard.shareable.forEach((shareable) => {
        const newFilter = buildNewQuery(shareable.filter);
        shareable.oldFilter = shareable.filter;
        shareable.filter = newFilter;
      });

      const newShareableList = lodash.cloneDeep(dashboard.shareable);

      // Save updated queries and log
      logger.info(`Update Dashboard (${dashboard._id})`);
      lodash.zip(oldShareableList, newShareableList)
        .forEach(([oldShareable, newShareable]) => {
          if (oldShareable.filter !== newShareable.filter) {
            logger.info('convert shareable filter');
            logger.info(oldShareable.filter);
            logger.info(newShareable.filter);
          }
        });

      dashboard.hasBeenMigrated = true;
      await dashboard.save();
    } catch (err) { logger.error(`Error updating Dashboard ${dashboard._id}`, err); }
  }
};

const convertStatementForwarding = async () => {
  const statementForwardings = await StatementForwarding.find();

  for (const statementForwarding of statementForwardings) {
    try {
      if (statementForwarding.hasBeenMigrated) {
        logger.warn(`statementForwarding (${statementForwarding._id}) has been migrated`);
        return;
      }

      const oldQuery = statementForwarding.query;
      const newQuery = buildNewQuery(oldQuery);

      statementForwarding.oldQuery = statementForwarding.query;
      statementForwarding.query = newQuery;

      logger.info(`Update StatementForwarding (${statementForwarding._id})`);
      logger.info('convert query');
      logger.info(oldQuery);
      logger.info(newQuery);

      statementForwarding.hasBeenMigrated = true;
      await statementForwarding.save();
    } catch (err) { logger.error(`Error updating SF ${statementForwarding._id}`, err); }
  }
};

const convertUsers = async () => {
  const users = await User.find();

  for (const user of users) {
    try {
      if (user.hasBeenMigrated) {
        logger.warn(`user (${user._id}) has been migrated`);
        return;
      }

      logger.info(`Update User (${user._id})`);

      user.organisationSettings.forEach((organisationSetting) => {
        const oldFilter = organisationSetting.filter;
        const newFilter = buildNewQuery(oldFilter);

        organisationSetting.oldFilter = organisationSetting.filter;
        organisationSetting.filter = newFilter;

        logger.info('convert organisationSettings filter');
        logger.info(oldFilter);
        logger.info(newFilter);
      });

      user.hasBeenMigrated = true;
      await user.save();
    } catch (err) { logger.error(`Error updating User ${user._id}`, err); }
  }
};

const convertQueries = async () => {
  const queries = await Query.find();

  for (const query of queries) {
    try {
      if (query.hasBeenMigrated) {
        logger.warn(`query (${query._id}) has been migrated`);
        return;
      }

      // query.conditions is not string, but has been JSON-parsed.
      const oldConditions = fromJS(query.conditions);
      const newConditions = _buildNewQuery(oldConditions).toJS();

      query.oldConditions = JSON.stringify(query.conditions);
      query.conditions = JSON.stringify(newConditions);

      logger.info(`Update Query (${query._id})`);
      logger.info('convert conditions');
      logger.info(JSON.stringify(oldConditions));
      logger.info(JSON.stringify(newConditions));

      query.hasBeenMigrated = true;
      await query.save();
    } catch (err) { logger.error(`Error updating Query ${query._id}`, err); }
  }
};

export default async () => {
  logger.info('Convert $or/$nor to $in/$nin in queries');
  try {
    await convertVisualisations();
    await convertDashboards();
    await convertStatementForwarding();
    await convertUsers();
    await convertQueries();
    logger.info('Finish converting $or/$nor to $in/$nin in queries');
  } catch (error) {
    logger.error(error);
  }
};
