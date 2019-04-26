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

const hasDeleteScope = (clientScopes) => {
  if (!clientScopes) {
    return false;
  }
  return includes(clientScopes, scopes.XAPI_STATEMENTS_DELETE);
};

const clientDeleteFilter = (lrs_id, filter) => {
  // Append the LRS ID to the filter if present
  if (lrs_id) {
    return {
      ...filter,
      lrs_id: objectId(lrs_id)
    };
  }

  return filter;
}

const clientDefaultFilter = (clientId, scopes, filter) => {
  if (hasReadMineScope(scopes)) {
    return {
      ...filter,
      client: objectId(clientId)
    };
  }
  return filter;
}

const clientFilter = (actionName, clientId, lrs_id, scopes, filter) => {
  switch (actionName) {
    case 'delete':
      return clientDeleteFilter(lrs_id, filter)
    default:
      return clientDefaultFilter(scopes, clientId, filter);
  }
}

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
}

export default async ({ actionName, authInfo, allowDashboardAccess = false }) => {
  const scopes = get(authInfo, 'client.scopes', false);
  
  if (actionName === 'edit' && !hasWriteScope(scopes)) {
    throw new NoAccessError();
  }

  if (actionName === 'delete' && !hasDeleteScope(scopes)) {
    throw new NoAccessError();
  }
  
  const filter = await createFilter(authInfo);
  
  const tokenType = getTokenTypeFromAuthInfo(authInfo);
  switch (tokenType) {
    case 'user':
      throw new NoAccessError();
    case 'dashboard':
      if (!allowDashboardAccess) {
        throw new NoAccessError();
      }
      return filter;
    case 'client':
      const clientId = get(authInfo, 'client._id', false);
      const lrs_id = get(authInfo, 'client.lrs_id', false)
      return clientFilter(actionName, clientId, lrs_id, scopes, filter);
    default:
      return filter;
  }
};
