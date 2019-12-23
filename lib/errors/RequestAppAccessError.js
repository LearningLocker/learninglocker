import BaseError from './BaseError';

export default class RequestAppAccessError extends BaseError {
  constructor() {
    super('Access request failed');
  }
}
