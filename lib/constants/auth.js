import passport from 'api/auth/passport';
import logger from 'lib/logger';
import _ from 'lodash';
import boolean from 'boolean';
import Promise from 'bluebird';
import parseRestifyQuery from 'lib/helpers/parseRestifyQuery';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getScopeFilterFromReq
  from 'lib/services/auth/requestSelectors/getScopeFilterFromReq';
import handleError from 'api/controllers/utils/handleError';
import { RESTIFY_PREFIX } from 'lib/constants/routes';
import Unauthorised from 'lib/errors/Unauthorised';

export const GOOGLE_AUTH_OPTIONS = {
  scope: ['https://www.googleapis.com/auth/plus.login', 'email'],
  approvalPrompt: 'auto',
  session: false
};

export const DEFAULT_PASSPORT_OPTIONS = {
  session: false
};

export const checkOrg = (req, res, next) => {
  const { model } = req.erm;
  const authInfo = req.user.authInfo || {};
  const organisation = getOrgFromAuthInfo(authInfo);

  if (!req.body.organisation && model.schema.path('organisation')) {
    req.body.organisation = organisation;
    return next();
  }
  if (!req.body.organisations && model.schema.path('organisations')) {
    req.body.organisations = [organisation];
    return next();
  }
  return next();
};

export const checkReadScopes = (req, res, next) => {
  const { model } = req.erm;
  model.readScopeChecks(req, res, next);
};
export const checkReadScopesPromise = Promise.promisify(checkReadScopes);

const parseQuery = (req) => {
  if (!req._ermQueryOptions || !req._ermQueryOptions.query) {
    return Promise.resolve();
  }

  return parseRestifyQuery(req._ermQueryOptions.query).then((parsedQuery) => {
    req._ermQueryOptions.query = parsedQuery;
  });
};

export const checkWriteScopes = (req, res, next) => {
  const { model } = req.erm;
  return model.writeScopeChecks(req, res, next);
};

export const setNoCacheHeaders = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: 0
  });
  next();
};

/**
 * Filter all incoming queries by the organisation
 * @param  {[type]}   model [description]
 * @param  {[type]}   req   [description]
 * @param  {Function} cb    [description]
 * @return {[type]}         [description]
 */
export const contextFilter = async function contextFilter(
  model,
  req,
  cb = () => {}
) {
  // setup a baseQuery to pass into the filter
  const baseQuery = [];
  if (model.schema.softDeletes) {
    const showTrashed = boolean(_.get(req, 'query.trashed', false));
    if (!showTrashed) {
      baseQuery.push({ deleted: { $ne: true } });
    }
  }

  // Creates the query.
  const scopeFilter = req.ll.scopeFilter;
  const filter = { $and: [...baseQuery, scopeFilter] };
  const query = model.find(filter);
  cb(query);
  return query;
};

export const RESTIFY_DEFAULTS = {
  prefix: '',
  version: RESTIFY_PREFIX,
  lowercase: true,
  lean: false,
  findOneAndUpdate: false,
  findOneAndRemove: false,
  preMiddleware: (req, res, next) => {
    passport.authenticate(
      ['jwt', 'clientBasic'],
      DEFAULT_PASSPORT_OPTIONS
    )(req, res, async () => {
      try {
        if (!req.user) {
          throw new Unauthorised();
        }
        const scopeFilter = await getScopeFilterFromReq(req);
        req.ll = { scopeFilter };
        return next();
      } catch (err) {
        return await handleError(res, err);
      }
    });
  },
  preCreate: checkOrg,
  preUpdate: checkOrg,
  preRead: async (req, res, next) => {
    await parseQuery(req);
    return next();
  },
  preDelete: async (req, res, next) => {
    // If no ID is sent in the URL, prevent the API from deleting the whole collection
    if (!req.params.id) {
      return res.status(400).send('API does not allow bulk deletions');
    }

    return next();
  },
  contextFilter,
  onError: (err, req, res) => {
    logger.error(err);
    if (err.statusCode) {
      res.status(err.statusCode);
    }
    res.send(err);
  }
};
