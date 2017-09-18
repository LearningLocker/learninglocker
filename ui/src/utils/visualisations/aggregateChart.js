import { fromJS, List } from 'immutable';
import grouper from 'ui/utils/visualisations/aggregationGroup/grouper';

export default (preReqs, axes) => {
  const valueType = axes.getIn(['value', 'optionKey'], 'statements');
  const groupType = axes.getIn(['group', 'optionKey'], 'date');
  const operatorType = axes.get('operator', 'uniqueCount');
  const aggregationGroup = grouper({ valueType, groupType, operatorType });
  const pipeline = preReqs.concat(fromJS(aggregationGroup));
  return new List([pipeline]);
};
