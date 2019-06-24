import { Map, List, fromJS } from 'immutable';
import { update$dteTimezone } from 'lib/helpers/update$dteTimezone';
import grouper from 'ui/utils/visualisations/aggregationGroup/grouper';

const aggregateScatterAxis = (axis, preReqs, axes, timezone) => {
  const valueType = axes.getIn([`${axis}Value`, 'optionKey'], 'statement');
  const groupType = axes.getIn(['group', 'optionKey'], 'date');
  const operatorType = axes.get(`${axis}Operator`);
  const contextActivityDefinitionType = axes.getIn(['group', 'contextActivityDefinitionType'], null);

  const match = axes.getIn([`${axis}Query`, '$match'], new Map());
  // Set timezone of When filters (timestamp and stored)
  const offsetFixedMatch = update$dteTimezone(match, timezone);
  const matchStage = offsetFixedMatch.size === 0 ? [] : [{ $match: offsetFixedMatch }];

  const aggregationGroup = grouper({ valueType, groupType, operatorType, timezone, contextActivityDefinitionType });
  const pipeline = preReqs.concat(fromJS(matchStage)).concat(fromJS(aggregationGroup));
  return pipeline;
};

/**
 * @param {*} preReqs
 * @param {*} axes
 * @param {string} timezone
 * @returns {immutable.List}
 */
export default (preReqs, axes, timezone) => new List([
  aggregateScatterAxis('x', preReqs, axes, timezone),
  aggregateScatterAxis('y', preReqs, axes, timezone),
]);
