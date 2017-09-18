import BaseError from './BaseError';

export default class extends BaseError {
  constructor() {
    super('Priviliges not sufficient for this operation');
  }
}
