import { Map, List, fromJS } from 'immutable';
import grouper from 'ui/utils/visualisations/aggregationGroup/grouper';

const aggregateScatterAxis = (axis, preReqs, axes) => {
  const valueType = axes.getIn([`${axis}Value`, 'optionKey']);
  const groupType = axes.getIn(['group', 'optionKey']);
  const operatorType = axes.get(`${axis}Operator`);
  const match = axes.getIn([`${axis}Query`, '$match'], new Map());
  const matchStage = match.size === 0 ? [] : [{ $match: match }];
  const aggregationGroup = grouper({ valueType, groupType, operatorType });
  const pipeline = preReqs.concat(fromJS(matchStage)).concat(fromJS(aggregationGroup));
  return pipeline;
};

export default (preReqs, axes) => new List([
  aggregateScatterAxis('x', preReqs, axes),
  aggregateScatterAxis('y', preReqs, axes),
]);
