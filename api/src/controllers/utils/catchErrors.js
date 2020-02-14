import handleRequestError from 'api/controllers/utils/handleRequestError';

/**
 * @callback catchErrorsHandler
 * @param {e.Request} request
 * @param {e.Response} response
 */

/**
 * @param {catchErrorsHandler} handler
 * @returns {handleRequestError}
 */
const catchErrors = handler =>
  /**
   * @param {e.Request} request
   * @param {e.Response} response
   * @returns {Promise<*>}
   */
  async (request, response) => {
    try {
      await handler(request, response);
    } catch (error) {
      return handleRequestError(response, error);
    }
  };

export default catchErrors;
