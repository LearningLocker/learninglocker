/**
 * @param {string} text
 * @returns {boolean}
 */
const jsonValidator = (text) => {
  try {
    JSON.parse(text);
    return true;
  } catch (e) {
    return false;
  }
};

export default jsonValidator;
