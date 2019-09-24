import BaseError from './BaseError';

export default class RequestAppAccessError extends BaseError {
  constructor() {
    super('Email not sent');
  }
}
