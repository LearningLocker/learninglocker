import { fromJS, Map } from 'immutable';
import lodash from 'lodash';
import logger from 'lib/logger';
import Visualisation from 'lib/models/visualisation';
import { Exception } from 'handlebars';

/**
 * @param {immutable.Map} condition
 * @returns {boolean}
 */
const isActorCondition = (condition) => {
  const comment = condition.get('$comment');
  const criteriaPath = JSON.parse(comment).criteriaPath || [];

  return criteriaPath.length === 2
    && criteriaPath[0] === 'statement'
    && criteriaPath[1] === 'actor';
};

/**
 * @param {immutable.Map} condition
 * @returns {boolean}
 */
const isPersonaIdCondition = (condition) => {
  const comment = condition.get('$comment');
  const criteriaPath = JSON.parse(comment).criteriaPath || [];

  return criteriaPath.length > 2
    && criteriaPath[0] === 'persona'
    && criteriaPath[1] === 'import';
};

/**
 * Convert queries on immutable object layer
 *
 * @param {immutable.Map} oldQuery
 * @returns {immutable.Map}
 */
const _buildNewQuery = (oldQuery) => {
  const oldConditions = oldQuery.getIn(['$match', '$and']);

  if (oldConditions === undefined) {
    return oldQuery;
  }

  const newConditions = oldConditions.map((condition) => {
    if (isActorCondition(condition) || isPersonaIdCondition(condition)) {
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

  return oldQuery.setIn(['$match', '$and'], newConditions);
};

/**
 * Convert query strings
 *
 * https://ht2labs.myjetbrains.com/youtrack/issue/LL-595
 *
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
    throw new Exception(`${error.message}: ${oldQuery}`);
  }
};

const convertVisualisations = async () => {
  const visualisations = await Visualisation.find({});

  visualisations.forEach((visualisation) => {
      // filters
    const oldQueries = visualisation.filters;
    const newQueries = visualisation.filters.reduce((acc, filter) => {
      const newQuery = buildNewQuery(filter);
      return acc.concat(newQuery);
    }, []);

      // axesxQuery
    const oldAxesxQuery = visualisation.axesxQuery;
    const newAxesxQuery = buildNewQuery(oldAxesxQuery);

      // axesyQuery
    const oldAxesyQuery = visualisation.axesyQuery;
    const newAxesyQuery = buildNewQuery(oldAxesyQuery);

      // Check whether queries are changed
    const isFiltersChanged = !lodash.isEqual(oldQueries, newQueries);
    const isAxesxQueryChanged = oldAxesxQuery !== newAxesxQuery;
    const isAxesyQueryChanged = oldAxesyQuery !== newAxesyQuery;

    const isVisualisationChanged = isFiltersChanged || isAxesxQueryChanged || isAxesyQueryChanged;

      // Do nothing if queries are not changed
    if (!isVisualisationChanged) {
      return;
    }

      // Save updated queries and log
    logger.info(`Update Visualisation (${visualisation._id})`);

    if (isFiltersChanged) {
      visualisation.filters = newQueries;
      logger.info('convert filters');
      logger.info(oldQueries);
      logger.info(newQueries);
    }

    if (isAxesxQueryChanged) {
      visualisation.axesxQuery = newAxesxQuery;
      logger.info('convert axesxQuery');
      logger.info(oldAxesxQuery);
      logger.info(newAxesxQuery);
    }

    if (isAxesyQueryChanged) {
      visualisation.axesyQuery = newAxesyQuery;
      logger.info('convert axesyQuery');
      logger.info(oldAxesyQuery);
      logger.info(newAxesyQuery);
    }

    visualisation.save();
  });
};

/**
 * Convert filters in all visualisations
 */
export default async () => {
  logger.info('Convert $or/$nor to $in/$nin in queries');
  try {
    await convertVisualisations();
    logger.info('Finish converting $or/$nor to $in/$nin in queries');
  } catch (error) {
    logger.error(error);
    process.exit();
  }
};
