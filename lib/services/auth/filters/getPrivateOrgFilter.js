import mongoose from 'mongoose';
import { isUndefined } from 'lodash';
import getOrgFilter from 'lib/services/auth/filters/getOrgFilter';
import getUserIdFromAuthInfo from 'lib/services/auth/authInfoSelectors/getUserIdFromAuthInfo';
import NoAccessError from 'lib/errors/NoAccessError';

const objectId = mongoose.Types.ObjectId;

export default (authInfo) => {
  const orgFilter = getOrgFilter(authInfo);
  const userId = getUserIdFromAuthInfo(authInfo);
  if (isUndefined(userId)) {
    return [];
  }
  const privateFilter = { owner: objectId(userId) };
  return [{ $and: [privateFilter, orgFilter] }];
};
