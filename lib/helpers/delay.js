/**
 * @param {number} msec - milliseconds
 * @returns {Promise}
 */
const delay = msec => new Promise(resolve => setTimeout(resolve, msec));

export default delay;
