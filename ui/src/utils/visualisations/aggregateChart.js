import { fromJS, List } from 'immutable';
import grouper from 'ui/utils/visualisations/aggregationGroup/grouper';

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
  const aggregationGroup = grouper({ valueType, groupType, operatorType, timezone });
  const pipeline = preReqs.concat(fromJS(aggregationGroup));
  return new List([pipeline]);
};
