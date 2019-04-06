import _ from 'lodash';

export const STATEMENT_QUEUE = 'STATEMENT_QUEUE';
export const STATEMENT_EXTRACT_PERSONAS_QUEUE = 'STATEMENT_PERSON_QUEUE';
export const STATEMENT_QUERYBUILDERCACHE_QUEUE = 'STATEMENT_QUERYBUILDERCACHE_QUEUE';
export const STATEMENT_FORWARDING_QUEUE = 'STATEMENT_FORWARDING_QUEUE';
export const STATEMENT_FORWARDING_REQUEST_QUEUE = 'STATEMENT_FORWARDING_REQEUST_QUEUE';
export const STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE = 'STATEMENT_FORWARDING_REQUEST_DELAYED_QUEUE';
export const STATEMENT_FORWARDING_DEADLETTER_QUEUE = 'STATEMENT_FORWARDING_DEADLETTER_QUEUE';

export const STATEMENT_ACTOR_MBOX = 'mbox';
export const STATEMENT_ACTOR_ACCOUNT = 'account';
export const STATEMENT_ACTOR_SHA1SUM = 'mbox_sha1sum';
export const STATEMENT_ACTOR_OPENID = 'openid';

export const getIfiDisplayName = (ifi) => {
  let name;
  let type;
  switch (_.get(ifi, 'key')) {
    case STATEMENT_ACTOR_MBOX:
      type = 'xAPI Mbox';
      name = _.get(ifi, 'value');
      break;
    case STATEMENT_ACTOR_ACCOUNT:
      type = 'xAPI Account';
      name = `${_.get(ifi, 'value.name')} - ${_.get(ifi, 'value.homePage')}`;
      break;
    case STATEMENT_ACTOR_SHA1SUM:
      type = 'xAPI Mbox Sha1Sum';
      name = _.get(ifi, 'value');
      break;
    case STATEMENT_ACTOR_OPENID:
      type = 'xAPI OpenID';
      name = _.get(ifi, 'value');
      break;
    default:
      type = 'Unknown';
      break;
  }

  return `${name} (${type})`;
};
