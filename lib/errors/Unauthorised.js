import BaseError from './BaseError';

/**
 * @class UnauthorisedError
 * @augments LLBaseError
 */
export default class extends BaseError {
  constructor() {
    super('Unauthorised');
  }
}
