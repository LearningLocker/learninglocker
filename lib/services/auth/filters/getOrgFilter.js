import mongoose from 'mongoose';
import { includes } from 'lodash';
import { SITE_ADMIN } from 'lib/constants/scopes';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getScopesFromAuthInfo from 'lib/services/auth/authInfoSelectors/getScopesFromAuthInfo';

const objectId = mongoose.Types.ObjectId;

export default (authInfo) => {
  const scopes = getScopesFromAuthInfo(authInfo);
  const orgId = getOrgFromAuthInfo(authInfo);
  const isSiteAdmin = includes(scopes, SITE_ADMIN);
  if (isSiteAdmin && !orgId) return {};
  return { organisation: objectId(orgId) };
};
