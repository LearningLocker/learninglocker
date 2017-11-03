export const HOME = 'home';

export const AUTH_RESETPASSWORD_REQUEST = '/auth/resetpassword/request';
export const AUTH_RESETPASSWORD_RESET = '/auth/resetpassword/reset';
export const AUTH_JWT_PASSWORD = '/auth/jwt/password';
export const AUTH_JWT_ORGANISATION = '/auth/jwt/organisation';

export const AUTH_JWT_GOOGLE = '/auth/jwt/google';
export const AUTH_JWT_GOOGLE_CALLBACK = '/auth/jwt/google/callback';
export const AUTH_JWT_SUCCESS = '/auth/jwt/success';

export const AUTH_CLIENT_INFO = '/auth/client/info';

export const SENDSMS = '/sendsms';

export const UPLOADPEOPLE = '/uploadpeople'; // TODO: remove
export const UPLOADLOGO = '/uploadlogo';
export const UPLOADPERSONAS = '/uploadpersonas';
export const IMPORTPERSONAS = '/importpersonas';

export const DOWNLOADLOGO = '/downloadlogo/:org';
export const DOWNLOADEXPORT = '/organisation/:organisationId/downloadexport/:download.csv';

export const EXPORT = '/export';

export const STATEMENTS_AGGREGATE = '/statements/aggregate';
export const STATEMENTS_COUNT = '/statements/count';
export const V1_STATEMENTS_AGGREGATE = '/v1/statements/aggregate';

export const MERGE_PERSONA = '/mergepersona';
export const ASSIGN_PERSONA = '/assignpersona';
export const CREATE_PERSONA_FROM_IDENTIFIER = '/createpersonafromidentifier';

export const RESTIFY_PREFIX = '/v2';

export const CONNECTION_PERSONA = '/connection/persona';
export const UPDATE_PERSONA = `${RESTIFY_PREFIX}/persona/:personaId`;
export const CONNECTION_PERSONA_IDENTIFIER = '/connection/personaidentifier';
export const CREATE_IDENTIFIER = `${RESTIFY_PREFIX}/personaIdentifier`;
export const GET_PERSONA_COUNT = `${RESTIFY_PREFIX}/persona/count`;
export const DELETE_PERSONA = `${RESTIFY_PREFIX}/persona/:personaId`;
export const ADD_PERSONA = `${RESTIFY_PREFIX}/persona`;
export const GET_PERSONA = `${RESTIFY_PREFIX}/persona/:personaId`;
export const GET_ATTRIBUTES = '/connection/personaattribute';

export const GRAPHQL = '/graphql';
export const GRAPHIQL = '/graphiql';

export const CONNECTION = '/connection';
export const INDEXES = '/indexes';

export const VERSION = '/app/version';
