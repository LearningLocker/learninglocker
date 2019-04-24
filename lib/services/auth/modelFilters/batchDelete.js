import { XAPI_STATEMENTS_DELETE } from 'lib/constants/scopes';
import { includes, get } from 'lodash';
import NoAccessError from 'lib/errors/NoAccessError';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import boolean from 'boolean';
import getTokenTypeFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getTokenTypeFromAuthInfo';

export default async ({ authInfo }) => {
  if (getTokenTypeFromAuthInfo(authInfo) === 'user' ||
    !(boolean(get(process.env, 'ENABLE_STATEMENT_DELETION', true)))
  ) {
    throw new NoAccessError();
  }

  if (includes(get(authInfo, 'client.scopes'), XAPI_STATEMENTS_DELETE)) {
    return {
      organisation: getOrgFromAuthInfo(authInfo),
    };
  }
};
