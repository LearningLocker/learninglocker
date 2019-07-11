import BaseError from './BaseError';

export default class AlreadyProcessingError extends BaseError {
  constructor(modelName, modelId) {
    super(`${modelName} - ${modelId} cannot be processed in it's current state.`);
  }
}
