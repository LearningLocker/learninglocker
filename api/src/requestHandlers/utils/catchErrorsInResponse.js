import handleRequestError from 'api/controllers/utils/handleRequestError';

/**
 * Catches errors from the given request handler and returns responses.
 * @param {() => Promise<void>} handler
 * @return {Promise<void>}
 */
export default async function catchErrorsInResponse(res, handler) {
  try {
    await handler();
  } catch (err) {
    return handleRequestError(res, err);
  }
}
