import { fromJS } from 'immutable';
import counter from 'ui/utils/visualisations/aggregationGroup/counter';

export default (preReqs, axes) => {
  console.log('ac', preReqs, axes)
  const valueType = axes.getIn(['value', 'optionKey'], 'statements');
  const groupType = axes.getIn(['group', 'optionKey'], 'date');
  const operatorType = axes.get('operator', 'uniqueCount');
  console.log('export',valueType, groupType, operatorType )
  const aggregationGroup = counter({ valueType, groupType, operatorType });
  const pipeline = preReqs.concat(aggregationGroup);
  return fromJS([pipeline]);
};
