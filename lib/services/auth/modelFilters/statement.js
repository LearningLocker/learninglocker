import mongoose from 'mongoose';
import parseQuery from 'lib/helpers/parseQuery';
import * as scopes from 'lib/constants/scopes';
import getFilterFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getFilterFromAuthInfo';
import getTokenTypeFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getTokenTypeFromAuthInfo';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import NoAccessError from 'lib/errors/NoAccessError';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import { get, includes } from 'lodash';
import getScopesFromAuthInfo from '../authInfoSelectors/getScopesFromAuthInfo';

const objectId = mongoose.Types.ObjectId;

const readAllScopes = [
  scopes.ALL,
  scopes.XAPI_ALL,
  scopes.XAPI_READ,
  scopes.XAPI_STATEMENTS_READ
];

const hasReadMineScope = (tokenScopes) => {
  const hasReadAllScope =
    tokenScopes.filter(scope => readAllScopes.includes(scope)).length !== 0;
  return (
    !hasReadAllScope && tokenScopes.includes(scopes.XAPI_STATEMENTS_READ_MINE)
  );
};

const hasWriteScope = (tokenScopes) => {
  if (!tokenScopes) {
    return false;
  }
  return includes(tokenScopes, scopes.XAPI_ALL) ||
  includes(tokenScopes, scopes.XAPI_STATEMENTS_WRITE);
};

const hasDeleteScope = (tokenScopes) => {
  if (!tokenScopes) {
    return false;
  }
  return includes(tokenScopes, scopes.XAPI_STATEMENTS_DELETE);
};

const clientDeleteFilter = (lrsId, filter) => {
  // Append the LRS ID to the filter if present
  if (lrsId) {
    return {
      ...filter,
      lrsId: objectId(lrsId)
    };
  }

  return filter;
};

const clientDefaultFilter = (clientId, tokenScopes, filter) => {
  if (hasReadMineScope(tokenScopes)) {
    return {
      ...filter,
      client: objectId(clientId)
    };
  }
  return filter;
};

const clientFilter = (actionName, authInfo, tokenScopes, filter) => {
  if (actionName === 'delete') {
    const lrsId = get(authInfo, 'client.lrs_id', false);
    return clientDeleteFilter(lrsId, filter);
  }

  const clientId = get(authInfo, 'client._id', false);
  return clientDefaultFilter(clientId, tokenScopes, filter);
};

const createFilter = async (authInfo) => {
  const authInfoFilter = getFilterFromAuthInfo(authInfo);
  const personaServiceFilter = {
    organisation: getOrgFromAuthInfo(authInfo)
  };
  const parsedFilter = await parseQuery(authInfoFilter, personaServiceFilter);
  const orgFilter = getOrgFilter(authInfo);
  return {
    ...parsedFilter,
    ...orgFilter
  };
};

export default async ({ actionName, authInfo, allowDashboardAccess = false }) => {
  const tokenType = getTokenTypeFromAuthInfo(authInfo);
  const tokenScopes = getScopesFromAuthInfo(authInfo);

  if (
    (actionName === 'create' || actionName === 'edit') &&
    !hasWriteScope(tokenScopes)) {
    throw new NoAccessError();
  }

  if (actionName === 'delete' && !hasDeleteScope(tokenScopes)) {
    throw new NoAccessError();
  }

  const filter = await createFilter(authInfo);

  switch (tokenType) {
    case 'user':
      throw new NoAccessError();
    case 'dashboard':
      if (!allowDashboardAccess) {
        throw new NoAccessError();
      }
      return filter;
    case 'client':
      return clientFilter(actionName, authInfo, tokenScopes, filter);
    default:
      return filter;
  }
};
