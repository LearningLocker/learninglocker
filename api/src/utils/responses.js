import logger from 'lib/logger';

const getErrorMessage = (error) => {
  if (error instanceof Error) return error.message;
  return error;
};

export const errorResponse = code => res => (error) => {
  logger.error(error);
  return res.status(code).send(getErrorMessage(error));
};
export const serverError = errorResponse(500);
export const mediaTypeError = errorResponse(415);
export const requestError = errorResponse(400);

export const jsonSuccess = res => json => res.status(200).json(json);
