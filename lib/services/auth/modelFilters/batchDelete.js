import { XAPI_STATEMENTS_DELETE } from 'lib/constants/scopes';
import { includes, get } from 'lodash';
import NoAccessError from 'lib/errors/NoAccessError';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import boolean from 'boolean';
import getScopesFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';

export default async ({ authInfo }) => {
  if (!(boolean(get(process.env, 'ENABLE_STATEMENT_DELETION', true)))) {
    throw new NoAccessError();
  }

  const tokenScopes = getScopesFromAuthInfo(authInfo);
  if (!includes(tokenScopes, XAPI_STATEMENTS_DELETE)) {
    throw new NoAccessError();
  }

  return {
    organisation: getOrgFromAuthInfo(authInfo),
  };
};
