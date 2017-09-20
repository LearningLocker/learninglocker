import keyExists from 'ui/utils/visualisations/helpers/keyExists';
import { fromJS } from 'immutable';
import createStagePipeline from 'ui/utils/visualisations/helpers/createStagePipeline';
import { VALUE_OP_CASE, getValueOpCase } from 'ui/utils/visualisations/helpers/valueOpCase';
import group from 'ui/utils/visualisations/projections/group';
import date from 'ui/utils/visualisations/projections/date';
import value from 'ui/utils/visualisations/projections/value';
import model from 'ui/utils/visualisations/projections/model';
import getOperator from 'ui/utils/visualisations/helpers/getOperator';
import uniqueModifierGrouper from './uniqueModifierGrouper';
import uniqueStatementModifierGrouper from './uniqueStatementModifierGrouper';
import uniqueTotalGrouper from './uniqueTotalGrouper';
import uniqueTotalStatementGrouper from './uniqueTotalStatementGrouper';
import valueGrouper from './valueGrouper';

const getGroupPipeline = ({ operatorType, groupType, valueOpCase, projections }) => {
  switch (valueOpCase) {
    case VALUE_OP_CASE.value:
      return valueGrouper({ operator: getOperator(operatorType), projections });
    case VALUE_OP_CASE.uniqueStatementCount:
      return uniqueTotalStatementGrouper({ projections });
    case VALUE_OP_CASE.uniqueCount:
      return uniqueTotalGrouper({ projections });
    case VALUE_OP_CASE.uniqueStatementModifier:
      return uniqueStatementModifierGrouper({ operator: getOperator(operatorType), groupType, projections });
    case VALUE_OP_CASE.uniqueModifier:
      return uniqueModifierGrouper({ operator: getOperator(operatorType), groupType, projections });
    default:
      return [];
  }
};

const getProjections = ({ valueType, groupType, valueOpCase }) => {
  switch (valueOpCase) {
    case VALUE_OP_CASE.value:
    case VALUE_OP_CASE.uniqueCount:
      return {
        group: group(groupType),
        value: value(valueType),
        model: model(groupType),
      };
    case VALUE_OP_CASE.uniqueStatementModifier:
      return {
        date: date(groupType),
        timestamp: '$timestamp',
        model: model(groupType),
      };
    case VALUE_OP_CASE.uniqueModifier:
      return {
        date: date(groupType),
        timestamp: '$timestamp',
        value: value(valueType),
        model: model(groupType),
      };
    case VALUE_OP_CASE.uniqueStatementCount:
      return {
        group: group(groupType),
        model: model(groupType),
      };
    default:
      return {};
  }
};

const getExistsMatch = ({ valueType, groupType, valueOpCase }) => {
  switch (valueOpCase) {
    case VALUE_OP_CASE.value:
    case VALUE_OP_CASE.uniqueCount:
      return { ...keyExists(valueType), ...keyExists(groupType) };
    case VALUE_OP_CASE.uniqueModifier:
      // groupType should always be timestamp (which always exists).
      return keyExists(valueType);
    case VALUE_OP_CASE.uniqueStatementCount:
      return keyExists(groupType);
    case VALUE_OP_CASE.uniqueStatementModifier:
    default:
      return {};
  }
};

const getUnwind = ({ groupType }) => {
  if (groupType.startsWith('statement.context.contextActivities.')) {
    return { path: `$${groupType}` };
  }
  return null;
};

export default ({ valueType, groupType, operatorType }) => {
  const valueOpCase = getValueOpCase({ valueType, operatorType });
  const existsMatch = getExistsMatch({ valueType, groupType, valueOpCase });

  const unwind = getUnwind({ valueType, groupType, operatorType });

  const projections = getProjections({ valueType, groupType, valueOpCase });
  const matchStage = createStagePipeline('$match', existsMatch);

  const projectStage = createStagePipeline('$project', projections);

  let preReqs;
  if (unwind) {
    const unwindStage = createStagePipeline('$unwind', unwind);
    preReqs = matchStage.concat(unwindStage).concat(projectStage);
  } else {
    preReqs = matchStage.concat(projectStage);
  }

  const countPipeline = fromJS(getGroupPipeline({ operatorType, groupType, valueOpCase, projections }));
  const sort = { $sort: { count: -1 } };
  const limit = { $limit: 366 };
  const finalProject = { $project: { _id: 1, count: 1, model: 1 } };

  const postReqs = fromJS([sort, limit, finalProject]);

  return preReqs.concat(countPipeline).concat(postReqs);
};
