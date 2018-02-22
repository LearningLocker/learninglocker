import ClientError from './ClientError';

export default class extends ClientError {
  constructor(modelId) {
    super(`Journey (${modelId}) not available for recalculation`);
  }
}
