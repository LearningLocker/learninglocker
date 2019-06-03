/**
 * @param {string} symbolOp - "<", ">", "<=", or ">="
 * @returns {string} - mongodb's comparison query operator
 */
export const symbolOpToMongoOp = (symbolOp) => {
  switch (symbolOp) {
    case '>': return '$gt';
    case '>=': return '$gte';
    case '<=': return '$lte';
    case '<':
    default: return '$lt';
  }
};

export default {};
