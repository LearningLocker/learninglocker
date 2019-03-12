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
 * @param {immutable.Map} oldFilter
 * @returns {immutable.Map}
 */
const _buildNewFilter = (oldFilter) => {
  const oldConditions = oldFilter.getIn(['$match', '$and']);

  if (oldConditions === undefined) {
    return oldFilter;
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

  return oldFilter.setIn(['$match', '$and'], newConditions);
};

/**
 * Convert query strings
 *
 * https://ht2labs.myjetbrains.com/youtrack/issue/LL-595
 *
 * @param {string} oldFilter
 * @returns {string}
 */
export const buildNewFilter = (oldFilter) => {
  const immutableOldFilter = fromJS(JSON.parse(oldFilter));
  try {
    const immutableNewFilter = _buildNewFilter(immutableOldFilter);
    return JSON.stringify(immutableNewFilter.toJS());
  } catch (error) {
    throw new Exception(`${error.message}: ${oldFilter}`);
  }
};

/**
 * Convert filters in all visualisations
 */
export default async () => {
  logger.info('Update visualisation filters using $in/$nin');

  try {
    const visualisations = await Visualisation.find({});

    visualisations.forEach((visualisation) => {
      logger.info(`Update Visualisation (${visualisation._id})`);

      const oldFilters = visualisation.filters;
      const newFilters = visualisation.filters.reduce((acc, filter) => {
        const newFilter = buildNewFilter(filter);
        return acc.concat(newFilter);
      }, []);

      if (lodash.isEqual(oldFilters, newFilters)) {
        return;
      }

      logger.info('old filters');
      logger.info(oldFilters);
      logger.info('new filters');
      logger.info(newFilters);

      visualisation.filters = newFilters;
      visualisation.save();
    });

    logger.info('Finish updating Visualisation filters');
  } catch (error) {
    logger.error(error);
    process.exit();
  }
};
