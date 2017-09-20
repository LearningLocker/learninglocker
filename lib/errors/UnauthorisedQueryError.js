import BaseError from './BaseError';

export default class extends BaseError {
  constructor() {
    super('The query requested was unauthorized');
  }
}
