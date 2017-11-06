import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import NotFoundError from 'lib/errors/NotFoundError';
import NoAccessError from 'lib/errors/NoAccessError';
import Unauthorised from 'lib/errors/Unauthorised';
import UnauthorisedQueryError from 'lib/errors/UnauthorisedQueryError';
import InvalidRecalc from 'lib/errors/InvalidRecalc';
import BaseError from 'lib/errors/BaseError';
import logger from 'lib/logger';

export default (res, err) => {
  logger.error(err);
  if (isNull(err) || isUndefined(null)) return res.status(500).send('Error');

  switch (err.constructor) {
    case NotFoundError:
      return res.status(404).send(err.message);
    case Unauthorised:
      return res.status(401).send(err.message);
    case NoAccessError:
    case UnauthorisedQueryError:
      return res.status(403).send(err.message);
    case InvalidRecalc:
      return res.status(400).send(err.message);
    case Error:
    case BaseError:
      return res.status(500).send(`${err.message}\n${err.stack}`);
    default:
      return res.status(500).send(err);
  }
};
