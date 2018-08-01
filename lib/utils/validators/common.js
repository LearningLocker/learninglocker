/* eslint-disable import/prefer-default-export */
export const minVal = (min, message, value, respond) => {
  if (value < min) {
    return respond(false, message || `Must be more than or equal to ${min}`);
  }

  respond(true);
};
