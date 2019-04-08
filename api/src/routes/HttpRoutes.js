import boolean from 'boolean';
import express from 'express';
import restify from 'express-restify-mongoose';
import git from 'git-rev';
import Promise from 'bluebird';
import {
  omit,
  findIndex,
  get
} from 'lodash';
import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import getTokenTypeFromAuthInfo from 'lib/services/auth/authInfoSelectors/getTokenTypeFromAuthInfo';
import getScopesFromAuthInfo from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';
import getUserIdFromAuthInfo from 'lib/services/auth/authInfoSelectors/getUserIdFromAuthInfo';
import { SITE_ADMIN } from 'lib/constants/scopes';
import { jsonSuccess, serverError } from 'api/utils/responses';
import passport from 'api/auth/passport';
import {
  GOOGLE_AUTH_OPTIONS,
  DEFAULT_PASSPORT_OPTIONS,
  RESTIFY_DEFAULTS,
  setNoCacheHeaders
} from 'lib/constants/auth';

// CONTROLLERS
import AuthController from 'api/controllers/AuthController';
import UploadController from 'api/controllers/UploadController';
import DownloadController from 'api/controllers/DownloadController';
import ExportController from 'api/controllers/ExportController';
import StatementController from 'api/controllers/StatementController';
import generateConnectionController from 'api/controllers/ConnectionController';
import generateIndexesController from 'api/controllers/IndexesController';
import ImportPersonasController from 'api/controllers/ImportPersonasController';
import StatementMetadataController from 'api/controllers/StatementMetadataController';

// REST
import LRS from 'lib/models/lrs';
import Client from 'lib/models/client';
import User from 'lib/models/user';
import Organisation from 'lib/models/organisation';
import Stream from 'lib/models/stream';
import Export from 'lib/models/export';
import Download from 'lib/models/download';
import Query from 'lib/models/query';
import ImportCsv from 'lib/models/importcsv';
import Statement from 'lib/models/statement';
import StatementForwarding from 'lib/models/statementForwarding';
import Visualisation from 'lib/models/visualisation';
import Dashboard from 'lib/models/dashboard';
import QueryBuilderCache from 'lib/models/querybuildercache';
import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';
import Role from 'lib/models/role';
import PersonasImport from 'lib/models/personasImport';
import PersonasImportTemplate from 'lib/models/personasImportTemplate';
import SiteSettings from 'lib/models/siteSettings';
import personaRESTHandler from 'api/routes/personas/personaRESTHandler';
import personaIdentifierRESTHandler from 'api/routes/personas/personaIdentifierRESTHandler';
import personaAttributeRESTHandler from 'api/routes/personas/personaAttributeRESTHandler';
import * as routes from 'lib/constants/routes';

const router = new express.Router();
router.use(setNoCacheHeaders);

router.get('', (req, res) => res.status(200).send('OK'));
router.get(routes.VERSION, (req, res) => {
  Promise.all([
    new Promise(resolve => git.short(resolve)),
    new Promise(resolve => git.long(resolve)),
    new Promise(resolve => git.branch(resolve)),
    new Promise(resolve => git.tag(resolve))
  ])
  .then(([short, long, branch, tag]) => {
    jsonSuccess(res)({ short, long, branch, tag });
  })
  .catch(serverError(res));
});
router.get(routes.GOOGLE_AUTH, (req, res) => {
  const enabled = boolean(process.env.GOOGLE_ENABLED);
  jsonSuccess(res)({ enabled });
});

/**
 * AUTHORIZATION
 */
router.post(
  routes.AUTH_RESETPASSWORD_REQUEST,
  AuthController.resetPasswordRequest
);
router.post(routes.AUTH_RESETPASSWORD_RESET, AuthController.resetPassword);
router.post(routes.AUTH_JWT_PASSWORD, AuthController.jwt);
router.post(
  routes.AUTH_JWT_ORGANISATION,
  passport.authenticate('jwt', DEFAULT_PASSPORT_OPTIONS),
  AuthController.jwtOrganisation
);

router.get(
  routes.AUTH_CLIENT_INFO,
  passport.authenticate('clientBasic', DEFAULT_PASSPORT_OPTIONS),
  AuthController.clientInfo
);

router.post(
  routes.OAUTH2_TOKEN,
  AuthController.issueOAuth2AccessToken
);

/**
 * TWO FACTOR / GOOGLE
 */
if (process.env.GOOGLE_ENABLED) {
  router.get(
    routes.AUTH_JWT_GOOGLE,
    passport.authenticate('google', GOOGLE_AUTH_OPTIONS)
  );
  router.get(
    routes.AUTH_JWT_GOOGLE_CALLBACK,
    passport.authenticate('google', DEFAULT_PASSPORT_OPTIONS),
    AuthController.googleSuccess
  );
}

router.get(
  routes.AUTH_JWT_SUCCESS,
  passport.authenticate('jwt', DEFAULT_PASSPORT_OPTIONS),
  AuthController.success
);

/**
 * Personas
 */
router.use(personaRESTHandler);
router.use(personaIdentifierRESTHandler);
router.use(personaAttributeRESTHandler);

/**
 * UPLOADS
 */
router.post(
  routes.UPLOADLOGO,
  passport.authenticate('jwt', DEFAULT_PASSPORT_OPTIONS),
  UploadController.uploadLogo
);

router.post(
  routes.UPLOADPERSONAS,
  passport.authenticate('jwt', DEFAULT_PASSPORT_OPTIONS),
  ImportPersonasController.uploadPersonas
);

router.post(
  routes.IMPORTPERSONAS,
  passport.authenticate('jwt', DEFAULT_PASSPORT_OPTIONS),
  ImportPersonasController.importPersonas
);

router.get(
  routes.IMPORTPERSONASERROR,
  passport.authenticate(['jwt', 'jwt-cookie'], DEFAULT_PASSPORT_OPTIONS),
  ImportPersonasController.importPersonasError
);

/**
 * DOWNLOADS
 */
router.get(
  routes.DOWNLOADLOGO,
  passport.authenticate(['jwt', 'jwt-cookie'], DEFAULT_PASSPORT_OPTIONS),
  DownloadController.downloadLogo
);
router.get(
  routes.DOWNLOADEXPORT,
  passport.authenticate(['jwt', 'jwt-cookie'], DEFAULT_PASSPORT_OPTIONS),
  DownloadController.downloadExport
);

/**
 * EXPORTS
 */
router.get(
  routes.EXPORT,
  passport.authenticate('jwt', DEFAULT_PASSPORT_OPTIONS),
  ExportController.downloadExport
);

/**
 * STATEMENTS
 */
router.get(
  routes.STATEMENTS_AGGREGATE,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  StatementController.aggregate
);
router.get(
  routes.STATEMENTS_COUNT,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  StatementController.count
);

router.patch(
  routes.STATEMENT_METADATA,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  StatementMetadataController.patchStatementMetadata
);
router.post(
  routes.STATEMENT_METADATA,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  StatementMetadataController.postStatementMetadata
);


/**
 * V1 compatability
 */
router.get(
  routes.V1_STATEMENTS_AGGREGATE,
  passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS),
  StatementController.v1aggregate
);

/**
 * REST APIS
 */
restify.defaults(RESTIFY_DEFAULTS);
restify.serve(router, Organisation, {
  preUpdate: (req, res, next) => {
    const authInfo = getAuthFromRequest(req);
    const scopes = getScopesFromAuthInfo(authInfo);
    if (
      findIndex(scopes, item => item === SITE_ADMIN) < 0
    ) {
      req.body = omit(req.body, 'expiration');
    }
    next();
  }
});
restify.serve(router, Stream);
restify.serve(router, Export);
restify.serve(router, Download);
restify.serve(router, Query);
restify.serve(router, ImportCsv);
restify.serve(router, User, {
  preUpdate: (req, res, next) => {
    const authInfo = getAuthFromRequest(req);
    const scopes = getScopesFromAuthInfo(authInfo);
    const tokenType = getTokenTypeFromAuthInfo(authInfo);

    // if site admin, skip over this section
    if (findIndex(scopes, item => item === SITE_ADMIN) < 0) {
      // remove scope changes
      req.body = omit(req.body, 'scopes');
      if (tokenType === 'user' || tokenType === 'organisation') {
        if (req.body._id !== getUserIdFromAuthInfo(authInfo).toString()) {
          // Don't allow changing of passwords
          req.body = omit(req.body, 'password');
        }
      } else {
        // always strip the password from other token types
        req.body = omit(req.body, 'password');
      }
    }

    next();
  }
});
restify.serve(router, Client);
restify.serve(router, Visualisation);
restify.serve(router, Dashboard);
restify.serve(router, LRS);
restify.serve(router, Statement, {
  preCreate: (req, res) => res.sendStatus(405),
  preDelete: (req, res, next) => {
    if (!boolean(get(process.env, 'ENABLE_SINGLE_STATEMENT_DELETION', true))) {
      res.sendStatus(405);
      return;
    }
    if (!req.params.id) {
      res.sendStatus(400);
      return;
    }
    next();
    return;
  },
  preUpdate: (req, res) => res.sendStatus(405),
});
restify.serve(router, StatementForwarding);
restify.serve(router, QueryBuilderCache);
restify.serve(router, QueryBuilderCacheValue);
restify.serve(router, Role);
restify.serve(router, PersonasImport);
restify.serve(router, PersonasImportTemplate);
restify.serve(router, SiteSettings);

/**
 * CONNECTIONS and INDEXES
 */
const generatedRouteModels = [
  Organisation,
  User,
  Statement,
  StatementForwarding,
  LRS,
  QueryBuilderCache,
  QueryBuilderCacheValue,
  Client,
  Dashboard,
  Visualisation,
  Query,
  Export,
  Download,
  ImportCsv,
  Role,
  PersonasImport,
  PersonasImportTemplate
];

const generateConnectionsRoute = (model, routeSuffix, authentication) => {
  const route = `${routes.CONNECTION}/${routeSuffix}`;
  const controller = generateConnectionController(model);
  router.get(route, authentication, controller);
};

const generateIndexesRoute = (model, routeSuffix, authentication) => {
  const route = `${routes.INDEXES}/${routeSuffix}`;
  const controller = generateIndexesController(model);
  router.get(route, authentication, controller);
};

const generateModelRoutes = (model) => {
  const routeSuffix = model.modelName.toLowerCase();
  const authentication = passport.authenticate(['jwt', 'clientBasic'], DEFAULT_PASSPORT_OPTIONS);
  generateConnectionsRoute(model, routeSuffix, authentication);
  generateIndexesRoute(model, routeSuffix, authentication);
};

generatedRouteModels.map(generateModelRoutes);

export default router;
