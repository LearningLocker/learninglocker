import passport from 'api/auth/passport';
import logger from 'lib/logger';
import _ from 'lodash';
import boolean from 'boolean';
import bluebird from 'bluebird';
import User from 'lib/models/user';
import parseQuery from 'lib/helpers/parseQuery';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getTokenTypeFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getTokenTypeFromAuthInfo';
import getScopeFilterFromReq
  from 'lib/services/auth/requestSelectors/getScopeFilterFromReq';
import getScopeSelectFromReq
    from 'lib/services/auth/requestSelectors/getScopeSelectFromReq';
import handleRequestError from 'api/controllers/utils/handleRequestError';
import { RESTIFY_PREFIX } from 'lib/constants/routes';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';

export const DEFAULT_PASSPORT_OPTIONS = {
  session: false
};

// Validity Period of OAuth2 Access Tokens
export const ACCESS_TOKEN_VALIDITY_PERIOD_SEC = 3600;

// Validity Period of JWT
const ONE_HOUR = '1h';
const ONE_WEEK = '7d';
export const JWT_ACCESS_TOKEN_EXPIRATION = _.defaultTo(process.env.JWT_ACCESS_TOKEN_EXPIRATION, ONE_HOUR);
export const JWT_REFRESH_TOKEN_EXPIRATION = _.defaultTo(process.env.JWT_REFRESH_TOKEN_EXPIRATION, ONE_WEEK);

const getUserFilter = (req) => {
  if (!req.params.id) {
    if (!req.body.email) {
      throw new Error('Must have an email to create or update user');
    }
    return { email: req.body.email };
  }
  return { _id: req.params.id };
};

export const checkOrg = async (req, res, next) => {
  const { model } = req.erm;
  const authInfo = req.user.authInfo || {};
  const tokenOrg = getOrgFromAuthInfo(authInfo);
  const tokenType = getTokenTypeFromAuthInfo(authInfo);

  // Handle standard models with organisation
  if (model.schema.path('organisation')) {
    if (!req.body.organisation) {
      req.body.organisation = tokenOrg;
      return next();
    }
    switch (tokenType) {
      case 'organisation':
      case 'client': {
        // org and client tokens have a prescribed org value
        req.body.organisation = tokenOrg;
        return next();
      }
      default:
        break;
    }
  }

  // Handle complex org models (e.g. User)
  if (model.schema.path('organisations')) {
    switch (tokenType) {
      case 'organisation':
      case 'client': {
        let filter;
        try {
          filter = getUserFilter(req);
        } catch (err) {
          return res.status(400).send(err.message);
        }

        const userOrg = [tokenOrg.toString()];
        const existingUser = await User.findOne(filter).lean().select({ organisations: 1 }).exec();


        // if orgs have not been sent
        if (!req.body.organisations) {
          if (existingUser && existingUser.organisations) {
            const existingOrgs = _.without(existingUser.organisations, null, undefined);
            const existingOrgsAsStrings = _.map(existingOrgs, id => id.toString());
            const unionedOrgs = _.union(userOrg, existingOrgsAsStrings);
            req.body.organisations = unionedOrgs;
          } else {
            req.body.organisations = userOrg;
          }
          return next();
        }

        // otherwise, we have been sent org data
        const requestOrgs = req.body.organisations;
        if (!Array.isArray(requestOrgs)) {
          return res.status(400).send('Invalid organisations array');
        }

        // if the tokens org is included in the incoming request
        if (_.includes(requestOrgs, tokenOrg.toString())) {
          // if we've found a user and they have orgs
          if (existingUser && existingUser.organisations) {
            const existingOrgs = _.without(existingUser.organisations, null, undefined);
            const existingOrgsAsStrings = _.map(existingOrgs, id => id.toString());
            if (_.includes(existingOrgsAsStrings, tokenOrg.toString())) {
              // just strip the orgs and leave the user as is
              delete req.body.organisations;
            } else {
              req.body.organisations = _.union(userOrg, existingOrgsAsStrings);
            }
          } else {
            // otherwise set the orgs to be that of the current token
            req.body.organisations = userOrg;
          }
        } else {
          // if the token's org isn't in the sent in data

          // if we've found a user and they have orgs
          if (existingUser && existingUser.organisations) {
            // remove the token's org from the users organisations
            const existingOrgs = _.without(existingUser.organisations, null, undefined);
            const existingOrgsAsStrings = _.map(existingOrgs, id => id.toString());
            req.body.organisations = _.without(existingOrgsAsStrings, tokenOrg.toString());
            return next();
          }

          return res.status(400).send('Cannot create user in a different organisation');
        }

        return next();
      }
      default:
        return next();
    }
  }
  return next();
};

export const checkReadScopes = (req, res, next) => {
  const { model } = req.erm;
  model.readScopeChecks(req, res, next);
};
export const checkReadScopesPromise = bluebird.promisify(checkReadScopes);

const parseRestifyQuery = (req) => {
  if (!req._ermQueryOptions || !req._ermQueryOptions.query) {
    return bluebird.resolve();
  }

  const authInfo = getAuthFromRequest(req);
  return parseQuery(req._ermQueryOptions.query, { authInfo }).then((parsedQuery) => {
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
  const scopeSelect = req.ll.scopeSelect;
  const filter = { $and: [...baseQuery, scopeFilter] };
  const query = model.find(filter);
  if (scopeSelect) {
    query.select(scopeSelect);
  }
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
  readPreference: 'primary',
  preMiddleware: (req, res, next) => {
    passport.authenticate(
      ['jwt', 'clientBasic'],
      DEFAULT_PASSPORT_OPTIONS,
      (err, user) => {
        if (err || !user) {
          res.status(401).set('Content-Type', 'text/plain').send('Unauthorized');
          return;
        }
        req.user = user;
        return Promise.all([
          getScopeFilterFromReq(req),
          getScopeSelectFromReq(req),
        ]).then(([scopeFilter, scopeSelect]) => {
          req.ll = { scopeFilter, scopeSelect };
          next();
          return;
        }).catch(e => handleRequestError(res, e));
      }
    )(req, res, next);
  },
  preCreate: checkOrg,
  preUpdate: checkOrg,
  preRead: async (req, res, next) => {
    await parseRestifyQuery(req);
    return next();
  },
  preDelete: async (req, res, next) => {
    // If no ID is sent in the URL, prevent the API from deleting the whole collection
    if (!req.params.id) {
      return res.status(400).send('API does not allow bulk deletions');
    }

    if (req.erm.document.constructor.auditRemove) {
      req.erm.document.constructor.auditRemove(req.erm.document, req.user);
    }

    return next();
  },
  contextFilter,
  onError: (err, req, res) => {
    logger.error('lib/constants/auth:', err.message);
    if (err.statusCode) {
      res.status(err.statusCode);
    }
    res.send(err);
  }
};
