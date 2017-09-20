import BaseError from './BaseError';

export default class extends BaseError {
  constructor(modelId) {
    super(`Journey (${modelId}) not available for recalculation`);
  }
}
