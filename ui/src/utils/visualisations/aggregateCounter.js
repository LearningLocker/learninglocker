import { fromJS } from 'immutable';
import counter from 'ui/utils/visualisations/aggregationGroup/counter';

/**
 * @param {*} preReqs
 * @param {*} axes
 * @param {string} timezone
 * @returns {immutable.List}
 */
export default (preReqs, axes, timezone) => {
  const valueType = axes.getIn(['value', 'optionKey'], 'statements');
  const groupType = axes.getIn(['group', 'optionKey'], 'date');
  const operatorType = axes.get('operator', 'uniqueCount');
  const aggregationGroup = counter({ valueType, groupType, operatorType, timezone });
  const pipeline = preReqs.concat(aggregationGroup);
  return fromJS([pipeline]);
};
