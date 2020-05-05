export const AGGREGATION_PROCESSOR_QUEUE = 'AGGREGATION_PROCESSOR_QUEUE';

export const AGGREGATION_TIMEOUT_MS = process.env.AGGREGATION_TIMEOUT_MS || (19 * 100 * 60);
export const LOCK_TIMEOUT_MINUTES = (AGGREGATION_TIMEOUT_MS / 100 / 60) + 1;
export const VISIBILITY_TIMEOUT_SECONDS = (LOCK_TIMEOUT_MINUTES + 1) * 60;

export const AGGREGATION_PROCESSOR_REGISTER = 'AGGREGATION_PROCESSOR_REGISTER';

export const TIMESTAMP_HINT = { organisation: 1, timestamp: -1, _id: -1 };
export const STORED_HINT = { organisation: 1, stored: -1, _id: -1 };
