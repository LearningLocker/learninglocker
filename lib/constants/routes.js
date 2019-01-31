export const HOME = 'home';

export const RESTIFY_PREFIX = '/v2';

export const AUTH_RESETPASSWORD_REQUEST = '/auth/resetpassword/request';
export const AUTH_RESETPASSWORD_RESET = '/auth/resetpassword/reset';
export const AUTH_JWT_PASSWORD = '/auth/jwt/password';
export const AUTH_JWT_ORGANISATION = '/auth/jwt/organisation';

export const AUTH_JWT_GOOGLE = '/auth/jwt/google';
export const AUTH_JWT_GOOGLE_CALLBACK = '/auth/jwt/google/callback';
export const AUTH_JWT_SUCCESS = '/auth/jwt/success';

export const AUTH_CLIENT_INFO = '/auth/client/info';

export const OAUTH2_TOKEN = '/oauth2/token';

export const SENDSMS = '/sendsms';

export const UPLOADLOGO = '/uploadlogo';
export const UPLOADPERSONAS = '/uploadpersonas';
export const IMPORTPERSONAS = '/importpersonas';
export const IMPORTPERSONASERROR = '/organisation/:organisationId/importpersonaserror/:id.csv';

export const DOWNLOADLOGO = '/downloadlogo/:org';
export const DOWNLOADEXPORT = '/organisation/:organisationId/downloadexport/:download.csv';

export const EXPORT = '/export';

export const STATEMENTS_AGGREGATE = '/statements/aggregate';
export const STATEMENTS_COUNT = '/statements/count';
export const V1_STATEMENTS_AGGREGATE = '/v1/statements/aggregate';

// Persona misc
export const MERGE_PERSONA = '/mergepersona';
export const ASSIGN_PERSONA = '/assignpersona';
export const CREATE_PERSONA_FROM_IDENTIFIER = '/createpersonafromidentifier';

// Persona
export const PERSONA = `${RESTIFY_PREFIX}/persona`;
export const PERSONA_ID = `${RESTIFY_PREFIX}/persona/:personaId`;
export const PERSONA_COUNT = `${RESTIFY_PREFIX}/persona/count`;
export const CONNECTION_PERSONA = '/connection/persona';

// PersonaIdentifier
export const PERSONA_IDENTIFIER = `${RESTIFY_PREFIX}/personaIdentifier`;
export const PERSONA_IDENTIFIER_UPSERT = `${RESTIFY_PREFIX}/personaIdentifier/upsert`;
export const PERSONA_IDENTIFIER_ID = `${RESTIFY_PREFIX}/personaIdentifier/:personaIdentifierId`;
export const PERSONA_IDENTIFIER_COUNT = `${RESTIFY_PREFIX}/personaIdentifier/count`;
export const CONNECTION_PERSONA_IDENTIFIER = '/connection/personaidentifier';

// PersonaAttribute
export const PERSONA_ATTRIBUTE = `${RESTIFY_PREFIX}/personaattribute`;
export const PERSONA_ATTRIBUTE_ID = `${RESTIFY_PREFIX}/personaattribute/:personaAttributeId`;
export const PERSONA_ATTRIBUTE_COUNT = `${RESTIFY_PREFIX}/personaattribute/count`;
export const CONNECTION_PERSONA_ATTRIBUTE = '/connection/personaattribute';

export const GRAPHQL = '/graphql';
export const GRAPHIQL = '/graphiql';

export const CONNECTION = '/connection';
export const INDEXES = '/indexes';

export const VERSION = '/app/version';
export const GOOGLE_AUTH = '/app/googleAuth';

export const STATEMENT_METADATA = `${RESTIFY_PREFIX}/statementmetadata/:id`;
