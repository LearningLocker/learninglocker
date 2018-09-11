import mongoose from 'mongoose';
import parseQuery from 'lib/helpers/parseQuery';
import * as scopes from 'lib/constants/scopes';
import getFilterFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getFilterFromAuthInfo';
import isOrgOwnerInAuthInfo
  from 'lib/services/auth/authInfoSelectors/isOrgOwnerInAuthInfo';
import getTokenTypeFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getTokenTypeFromAuthInfo';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import NoAccessError from 'lib/errors/NoAccessError';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import { get, includes } from 'lodash';

const objectId = mongoose.Types.ObjectId;

const readAllScopes = [
  scopes.ALL,
  scopes.XAPI_ALL,
  scopes.XAPI_READ,
  scopes.XAPI_STATEMENTS_READ
];

const hasReadMineScope = (clientScopes) => {
  const hasReadAllScope =
    clientScopes.filter(scope => readAllScopes.includes(scope)).length !== 0;
  return (
    !hasReadAllScope && clientScopes.includes(scopes.XAPI_STATEMENTS_READ_MINE)
  );
};

const hasWriteScope = (clientScopes) => {
  if (!clientScopes) {
    return false;
  }
  return includes(clientScopes, scopes.XAPI_ALL, scopes.XAPI_STATEMENTS_WRITE);
};

export default async ({ actionName, authInfo }) => {
  const tokenType = getTokenTypeFromAuthInfo(authInfo);

  if (actionName !== 'view' && !hasWriteScope(get(authInfo, 'client.scopes'))) {
    throw new NoAccessError();
  }

  const isOwner = tokenType !== 'dashboard' && await isOrgOwnerInAuthInfo(authInfo);
  const orgFilter = getOrgFilter(authInfo);
  const filter = getFilterFromAuthInfo(authInfo);
  const filterQuery = await parseQuery(filter, {
    organisation: getOrgFromAuthInfo(authInfo)
  });
  const query = {
    ...filterQuery,
    ...orgFilter
  };
  if (isOwner) return query;

  if (authInfo.client) {
    const clientScopes = authInfo.client.scopes;
    const isReadMineScope = hasReadMineScope(clientScopes);
    if (isReadMineScope) {
      return {
        ...query,
        client: objectId(authInfo.client._id)
      };
    }
  }
  if (getTokenTypeFromAuthInfo(authInfo) !== 'user') {
    return query;
  }
  throw new NoAccessError();
};
