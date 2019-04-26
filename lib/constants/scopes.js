import { omit, get } from 'lodash';

export const ALL = 'all';

export const VIEW_SHAREABLE_DASHBOARD = 'dashboard/shareable/view';

// UDD
export const STUDENT_APP = 'student_app';
export const TRIBAL_INSIGHT = 'tribal_insight';
export const LAP = 'lap';
export const SSP = 'ssp';
export const OPENDASH = 'opendash';
export const UDD_READ = 'udd/read';

// xAPI
export const XAPI_ALL = 'xapi/all';
export const XAPI_READ = 'xapi/read';
export const XAPI_STATEMENTS_READ = 'statements/read';
export const XAPI_STATEMENTS_WRITE = 'statements/write';
export const XAPI_STATEMENTS_READ_MINE = 'statements/read/mine';
export const XAPI_STATE_ALL = 'state';
export const XAPI_PROFILE_ALL = 'profile';
export const XAPI_STATEMENTS_DELETE = 'statements/delete';

export const XAPI_SCOPES = {
  [XAPI_ALL]: 'All (xAPI)',
  [XAPI_READ]: 'Read all',
  [XAPI_STATEMENTS_READ]: 'Read all statements',
  [XAPI_STATEMENTS_WRITE]: 'Write statements (must be used with a read scope)',
  [XAPI_STATEMENTS_READ_MINE]: 'Read my statements',
  [XAPI_STATE_ALL]: 'Access state',
  [XAPI_PROFILE_ALL]: 'Access profiles',
};

export const getXapiScopes = (
  deleteStatementsEnabled = get(process.env, 'ENABLE_STATEMENT_DELETION', true)
  ) => {
  let out = XAPI_SCOPES;
  if (!deleteStatementsEnabled) {
    out = omit(out, XAPI_STATEMENTS_DELETE);
  }
  return out;
};

export const API_SCOPES = {
  [ALL]: 'API All',
  [XAPI_STATEMENTS_DELETE]: 'Delete statements (not covered by All scope)',
};

export const CLIENT_SCOPES = {
  ...API_SCOPES,
  ...XAPI_SCOPES,
};

// USERS
export const SITE_ADMIN = 'site_admin';
export const SITE_CAN_CREATE_ORG = 'site_can_create_org';

export const SITE_SCOPES = {
  [SITE_ADMIN]: 'Site Administrator',
  [SITE_CAN_CREATE_ORG]: 'Can create organisation'
};

// ORGANISATION_USER
export const OBSERVER = 'observer';
export const USER_SCOPES = {
  [ALL]: 'Organisation Administrator',
  [OBSERVER]: 'Organisation Observer',
};
