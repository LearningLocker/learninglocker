import { BaseError } from 'make-error';

export default class ForwardingRequestError extends BaseError {

  constructor(errorMessage, messageBody) {
    super(errorMessage);
    this.messageBody = messageBody;
  }
}
