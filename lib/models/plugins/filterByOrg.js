import includes from 'lodash/includes';
import mongoose from 'mongoose';
import * as scopes from 'lib/constants/scopes';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getScopesFromAuthInfo from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';

const objectId = mongoose.Types.ObjectId;

export async function getOrgFilterFromAuth(authInfo, baseQuery = {}) {
  const organisation = getOrgFromAuthInfo(authInfo);
  const query = {
    ...baseQuery,
    organisation: objectId(organisation)
  };
  return query;
}

export async function filterByAuth(authInfo, filter) {
  const authScopes = getScopesFromAuthInfo(authInfo);
  const organisationId = getOrgFromAuthInfo(authInfo);
  const isSiteAdmin = includes(authScopes, scopes.SITE_ADMIN);
  if (isSiteAdmin && !organisationId) return filter;
  const orgFilter = await this.getOrgFilterFromAuth(authInfo, filter);
  return orgFilter;
}

export default function filterByOrg(schema) {
  schema.statics.getOrgFilterFromAuth = getOrgFilterFromAuth;
  schema.statics.filterByAuth = filterByAuth;
}
