import assign from 'lodash/assign';

function errorFactory(className) {
  function CustomError(message, options) {
    this.name = className;
    this.message = message;
    this.stack = new Error().stack; // Optional

    assign(this, options);
  }
  CustomError.prototype = Object.create(Error.prototype);
  CustomError.prototype.constructor = CustomError;
  return CustomError;
}

export default errorFactory;
