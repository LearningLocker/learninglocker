export const Operators = {
  IN: '$in',
  NIN: '$nin'
};

/**
 * @param {Operators} op - mongodb's comparison query operator
 * @returns {string} - "In" or "Out"
 */
export const opToString = op => ((op === Operators.IN) ? 'In' : 'Out');

/**
 * @param {string} str - "In" or "Out"
 * @returns {Operators} - mongodb's comparison query operator
 */
export const stringToOp = str => ((str === 'In') ? Operators.IN : Operators.NIN);


export default {};
