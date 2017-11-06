import mongoose from 'mongoose';
import { isUndefined } from 'lodash';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import getUserIdFromAuthInfo from 'lib/services/auth/authInfoSelectors/getUserIdFromAuthInfo';

const objectId = mongoose.Types.ObjectId;

export default (authInfo) => {
  const orgFilter = getOrgFilter(authInfo);
  const userId = getUserIdFromAuthInfo(authInfo);
  if (isUndefined(userId)) {
    // will reject on a client token type
    return false;
  }
  const privateFilter = { owner: objectId(userId) };
  return { $and: [privateFilter, orgFilter] };
};
