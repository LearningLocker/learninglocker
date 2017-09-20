export default class {
  constructor(message) {
    this.message = message;
    this.name = this.constructor.name;
    this.stack = new Error(message).stack;
  }
}
