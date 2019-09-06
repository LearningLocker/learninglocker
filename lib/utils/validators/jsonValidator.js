import { fromJS, Map } from 'immutable';

/**
 * @param {any} input
 * @returns {boolean}
 */
export const isJSONParsable = (input) => {
  try {
    JSON.parse(input);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Is input is JSON string and parsed value is an Object AND not an Array?
 * If this function returns true, immutable.fromJS(returnedValue) is immutable.Map.
 *
 * @param {any} input
 * @returns {boolean}
 */
export const isKeyedJSONString = input =>
  isJSONParsable(input) && Map.isMap(fromJS(JSON.parse(input)));
