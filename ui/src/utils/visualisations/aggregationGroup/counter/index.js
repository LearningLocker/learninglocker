import keyExists from 'ui/utils/visualisations/helpers/keyExists';
import createStagePipeline from 'ui/utils/visualisations/helpers/createStagePipeline';
import { VALUE_OP_CASE, getValueOpCase } from 'ui/utils/visualisations/helpers/valueOpCase';
import group from 'ui/utils/visualisations/projections/group';
import value from 'ui/utils/visualisations/projections/value';
import getOperator from 'ui/utils/visualisations/helpers/getOperator';
import uniqueModifierCounter from './uniqueModifierCounter';
import uniqueTotalCounter from './uniqueTotalCounter';
import uniqueTotalStatementCounter from './uniqueTotalStatementCounter';
import valueCounter from './valueCounter';

const getCountPipeline = ({ operatorType, valueOpCase, projections }) => {
  switch (valueOpCase) {
    case VALUE_OP_CASE.value:
      return valueCounter({ operator: getOperator(operatorType), projections });
    case VALUE_OP_CASE.uniqueStatementCount:
      return uniqueTotalStatementCounter({ projections });
    case VALUE_OP_CASE.uniqueCount:
      return uniqueTotalCounter({ projections });
    case VALUE_OP_CASE.uniqueStatementModifier:
    case VALUE_OP_CASE.uniqueModifier:
      return uniqueModifierCounter({ operator: getOperator(operatorType), projections });
    default:
      return [];
  }
};

const getProjections = ({ valueType, groupType, valueOpCase }) => {
  switch (valueOpCase) {
    case VALUE_OP_CASE.value:
    case VALUE_OP_CASE.uniqueCount:
      return { value: value(valueType) };
    case VALUE_OP_CASE.uniqueStatementModifier:
    case VALUE_OP_CASE.uniqueModifier:
      return { group: group(groupType) };
    case VALUE_OP_CASE.uniqueStatementCount:
    default:
      return {};
  }
};

const getExistsMatch = ({ valueType, groupType, valueOpCase }) => {
  switch (valueOpCase) {
    case VALUE_OP_CASE.value:
    case VALUE_OP_CASE.uniqueCount:
      return keyExists(valueType);
    case VALUE_OP_CASE.uniqueStatementModifier:
    case VALUE_OP_CASE.uniqueModifier:
      return keyExists(groupType);
    case VALUE_OP_CASE.uniqueStatementCount:
    default:
      return {};
  }
};

export default ({ valueType, groupType, operatorType }) => {
  const valueOpCase = getValueOpCase({ valueType, operatorType });
  const existsMatch = getExistsMatch({ valueType, groupType, valueOpCase });
  const projections = getProjections({ valueType, groupType, valueOpCase });
  const matchStage = createStagePipeline('$match', existsMatch);
  const projectStage = createStagePipeline('$project', projections);
  const preReqs = matchStage.concat(projectStage);
  const countPipeline = getCountPipeline({ operatorType, valueOpCase, projections });
  return preReqs.concat(countPipeline);
};
