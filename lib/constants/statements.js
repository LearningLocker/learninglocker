import _ from 'lodash';

export const STATEMENT_QUEUE = 'STATEMENT_QUEUE';
export const STATEMENT_EXTRACT_PERSONAS_QUEUE = 'STATEMENT_PERSON_QUEUE';
export const STATEMENT_LRSCOUNT_QUEUE = 'STATEMENT_LRSCOUNT_QUEUE';
export const STATEMENT_QUERYBUILDERCACHE_QUEUE = 'STATEMENT_QUERYBUILDERCACHE_QUEUE';
export const STATEMENT_FORWARDING_QUEUE = 'STATEMENT_FORWARDING_QUEUE';
export const STATEMENT_FORWARDING_REQUEST_QUEUE = 'STATEMENT_FORWARDING_REQEUST_QUEUE';
export const STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE = 'STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE';
export const STATEMENT_FORWARDING_DEADLETTER_QUEUE = 'STATEMENT_FORWARDING_DEADLETTER_QUEUE';

export const STATEMENT_ACTOR_MBOX = 'statement.actor.mbox';
export const STATEMENT_ACTOR_ACCOUNT = 'statement.actor.account';
export const STATEMENT_ACTOR_SHA1SUM = 'statement.actor.sha1sum';
export const STATEMENT_ACTOR_OPENID = 'statement.actor.openid';
export const STATEMENT_ACTOR_NAME = 'statement.actor.name';
export const STATEMENT_CONTEXT_REGISTRATION = 'statement.context.registration';

export const STATEMENT_ACTOR_ACCOUNT_NAME = 'statement.actor.account.name';
export const STATEMENT_ACTOR_ACCOUNT_HOMEPAGE = 'statement.actor.account.homePage';

export const removeMailto = value => value.replace(/^mailto:/i, '');

export const IDENTIFIABLE_STATEMENT_KEYS = [
  STATEMENT_ACTOR_MBOX,
  STATEMENT_ACTOR_ACCOUNT,
  STATEMENT_ACTOR_SHA1SUM,
  STATEMENT_ACTOR_OPENID
];

export const SCORABLE_KEY_SETTINGS = {
  [STATEMENT_ACTOR_MBOX]: {
    score: 2,
    caseSensitive: false,
    matchType: 'fuzzy',
    valueTransformer: removeMailto
  },
  [STATEMENT_ACTOR_OPENID]: {
    score: 3,
    caseSensitive: false,
    matchType: 'fuzzy'
  },
  [STATEMENT_ACTOR_NAME]: {
    score: 1.5,
    caseSensitive: false,
    matchType: 'fuzzy'
  },
  [STATEMENT_CONTEXT_REGISTRATION]: {
    score: 3,
    caseSensitive: true,
    matchType: 'match'
  },
  [STATEMENT_ACTOR_ACCOUNT_HOMEPAGE]: {
    score: 1,
    caseSensitive: false,
    matchType: 'fuzzy'
  },
  [STATEMENT_ACTOR_ACCOUNT_NAME]: {
    score: 3,
    caseSensitive: true,
    matchType: 'fuzzy'
  },
};


export const DEFAULT_IDENT_SCORES = {
  [STATEMENT_ACTOR_MBOX]: 3,
  [STATEMENT_ACTOR_OPENID]: 3,
  [STATEMENT_ACTOR_NAME]: 2,
  [STATEMENT_ACTOR_ACCOUNT_HOMEPAGE]: 1,
  [STATEMENT_ACTOR_ACCOUNT_NAME]: 3,
  [STATEMENT_CONTEXT_REGISTRATION]: 2
};

export const CASE_SENSITIVE_KEYS = [
  STATEMENT_ACTOR_ACCOUNT_NAME,
  STATEMENT_CONTEXT_REGISTRATION
];


export const getUniqueIdentifierDisplayName = (uniqueIdent) => {
  let name;
  let type;
  switch (_.get(uniqueIdent, 'key')) {
    case STATEMENT_ACTOR_MBOX:
      type = 'xAPI Mbox';
      name = _.get(uniqueIdent, 'value');
      break;
    case STATEMENT_ACTOR_ACCOUNT:
      type = 'xAPI Account';
      name = `${_.get(uniqueIdent, 'value.name')} - ${_.get(uniqueIdent, 'value.homePage')}`;
      break;
    case STATEMENT_ACTOR_SHA1SUM:
      type = 'xAPI Mbox Sha1Sum';
      name = _.get(uniqueIdent, 'value');
      break;
    case STATEMENT_ACTOR_OPENID:
      type = 'xAPI OpenID';
      name = _.get(uniqueIdent, 'value');
      break;
    default:
      type = 'Unknown';
      break;
  }

  return `${name} (${type})`;
};
