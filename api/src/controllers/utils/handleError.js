import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import NotFoundError from 'lib/errors/NotFoundError';
import NoAccessError from 'lib/errors/NoAccessError';
import Unauthorised from 'lib/errors/Unauthorised';
import UnauthorisedQueryError from 'lib/errors/UnauthorisedQueryError';
import InvalidRecalc from 'lib/errors/InvalidRecalc';
import BaseError from 'lib/errors/BaseError';
import logger from 'lib/logger';
import EmptyCsvError from 'lib/errors/EmptyCsvError';
import DuplicateCsvHeadersError from 'lib/errors/DuplicateCsvHeadersError';

import PersonaConflict from 'personas/dist/errors/Conflict';
import PersonaNoModel from 'personas/dist/errors/NoModel';
import PersonaNoModelWithId from 'personas/dist/errors/NoModelWithId';

export default (res, err) => {
  logger.error(err);
  if (isNull(err) || isUndefined(null)) return res.status(500).send('Error');

  // persona errors
  if (err instanceof PersonaNoModelWithId) {
    return res.status(404).send(`No model found for ${err.modelName} with id ${err.id}`);
  }
  if (err instanceof PersonaNoModel) {
    return res.status(404).send(`No model found for ${err.modelName}`);
  }
  if (err instanceof PersonaConflict) {
    return res.status(404).send('');
  }

  // app errors
  if (err instanceof NotFoundError) {
    return res.status(404).send(err.message);
  }

  if (err instanceof Unauthorised) {
    return res.status(401).send(err.message);
  }

  if (
    err instanceof NoAccessError ||
    err instanceof UnauthorisedQueryError
  ) {
    return res.status(403).send(err.message);
  }

  if (
    err instanceof InvalidRecalc ||
    err instanceof EmptyCsvError ||
    err instanceof DuplicateCsvHeadersError
  ) {
    return res.status(400).send(err.message);
  }

  if (
    err instanceof Error ||
    err instanceof BaseError
  ) {
    return res.status(500).send(`${err.message}\n${err.stack}`);
  }

  return res.status(500).send(err);
};
