
export default class ForwardingRequestError extends Error {

  constructor(errorMessage, messageBody) {
    super(errorMessage);
    this.messageBody = messageBody;
  }
}
