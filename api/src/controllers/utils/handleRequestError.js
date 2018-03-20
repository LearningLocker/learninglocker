import NotFoundError from 'lib/errors/NotFoundError';
import NoAccessError from 'lib/errors/NoAccessError';
import Unauthorised from 'lib/errors/Unauthorised';
import UnauthorisedQueryError from 'lib/errors/UnauthorisedQueryError';
import BaseError from 'lib/errors/BaseError';
import ClientError from 'lib/errors/ClientError';
import logger from 'lib/logger';
import defaultTo from 'lodash/defaultTo';
import { v4 as uuid } from 'uuid';
import PersonaConflict from '@learninglocker/persona-service/dist/errors/Conflict';
import NoModel from 'jscommons/dist/errors/NoModel';
import AllreadyProcessingError from 'lib/errors/AllreadyProcessingError';
import PersonaNoModelWithId from '@learninglocker/persona-service/dist/errors/NoModelWithId';

export const unawaitedErrorHandler = (err) => {
  const errorId = uuid();
  logger.error(errorId, err);
};

export default (res, err) => {
  const errorId = uuid();

  // persona errors
  if (err instanceof PersonaNoModelWithId) {
    return res.status(404).send({
      errorId,
      message: `No model found for ${err.modelName} with id ${err.id}`,
    });
  }
  if (err instanceof NoModel) {
    return res.status(404).send({
      errorId,
      message: `No model found for ${err.modelName}`
    });
  }
  if (err instanceof PersonaConflict) {
    return res.status(400).send({
      errorId,
      message: 'This model already exists'
    });
  }

  // app errors
  if (err instanceof NotFoundError) {
    return res.status(404).send({
      errorId,
      message: err.message
    });
  }

  if (err instanceof Unauthorised) {
    return res.status(401).send({
      errorId,
      message: err.message
    });
  }

  if (
    err instanceof NoAccessError ||
    err instanceof UnauthorisedQueryError
  ) {
    return res.status(403).send({
      errorId,
      message: err.message
    });
  }

  if (
    err instanceof ClientError
  ) {
    return res.status(400).send({
      errorId,
      message: err.message
    });
  }

  if (
    err instanceof AllreadyProcessingError
  ) {
    return res.status(409).send({
      errorId,
      message: err.message
    });
  }


  logger.error(errorId, err);

  if (
    err instanceof Error ||
    err instanceof BaseError
  ) {
    const response = {
      errorId,
      message: err.message
    };
    const logLevel = defaultTo(process.env.LOG_MIN_LEVEL, 'info');
    if (
      logLevel === 'debug' ||
      logLevel === 'silly'
    ) {
      response.stack = err.stack;
    }
    return res.status(500).send(response);
  }

  return res.status(500).send({
    errorId,
    message: 'Error'
  });
};
