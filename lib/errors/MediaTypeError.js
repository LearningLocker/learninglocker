import BaseError from './BaseError';

export default class extends BaseError {
  constructor(err) {
    super(err.message);
  }
}
