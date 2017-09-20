function errorFactory(className) {
  function CustomError(message) {
    this.name = className;
    this.message = message;
    this.stack = new Error().stack; // Optional
  }
  CustomError.prototype = Object.create(Error.prototype);
  CustomError.prototype.constructor = CustomError;
  return CustomError;
}

export default errorFactory;
