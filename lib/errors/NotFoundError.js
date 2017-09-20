import BaseError from './BaseError';

export default class extends BaseError {
  constructor(modelName, modelId) {
    super(`Could not find ${modelName} with ${modelId}`);
  }
}
