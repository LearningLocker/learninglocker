import mongoose from 'mongoose';
import parseQuery from 'lib/helpers/parseQuery';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import getOrgFromAuthInfo
  from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import { getConnection as getDBConnection } from 'lib/connections/mongoose';
import _ from 'lodash';

const objectId = mongoose.Types.ObjectId;

const getLrsFilter = ({
  authInfo,
  modelName
}) => {
  if (!getDBConnection().model(modelName).schema.paths.lrs_id) {
    return;
  }
  if (
    authInfo.client && authInfo.client.lrs_id
  ) {
    return {
      lrs_id: objectId(authInfo.client.lrs_id)
    };
  }
};

const getParsedScopedFilter = async ({
  authInfo,
  filter,
  modelName,
  actionName
}) => {
  const parsedFilter = await parseQuery(filter, {
    organisation: getOrgFromAuthInfo(authInfo)
  });
  const scopedFilter = await getScopeFilter({
    modelName,
    actionName,
    authInfo
  });
  const lrsFilter = getLrsFilter({
    authInfo,
    modelName,
  });

  const filters = [parsedFilter, scopedFilter, lrsFilter]
    .filter(item => !_.isUndefined(item) && !_.isEmpty(item));

  const parsedScopeFilter = filters.length <= 1
    ? _.first(filters)
    : { $and: filters };
  return parsedScopeFilter;
};

export default getParsedScopedFilter;
