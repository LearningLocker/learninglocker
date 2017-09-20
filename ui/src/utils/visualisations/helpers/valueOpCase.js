export const VALUE_OP_CASE = {
  other: 0,
  value: 1,
  uniqueStatementCount: 2,
  uniqueCount: 3,
  uniqueModifier: 4,
  uniqueStatementModifier: 5,
};

export const getValueOpCase = ({
  operatorType, valueType,
}) => {
  switch (operatorType) {
    case 'count':
    case 'average':
    case 'max':
    case 'min':
      return VALUE_OP_CASE.value;
    case 'uniqueCount':
      return (
        valueType === 'statements' ?
        VALUE_OP_CASE.uniqueStatementCount :
        VALUE_OP_CASE.uniqueCount
      );
    case 'uniqueAverage':
    case 'uniqueMax':
    case 'uniqueMin':
      return (
        valueType === 'statements' ?
        VALUE_OP_CASE.uniqueStatementModifier :
        VALUE_OP_CASE.uniqueModifier
      );
    default: return VALUE_OP_CASE.other;
  }
};
