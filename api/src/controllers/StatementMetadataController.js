import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import catchErrors from 'api/controllers/utils/catchErrors';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import Statement, { mapDot } from 'lib/models/statement';
import QueryBuilderCache from 'lib/models/querybuildercache';
import QueryBuilderCacheValue from 'lib/models/querybuildercachevalue';
import encodeDot from 'lib/helpers/encodeDot';
import logger from 'lib/logger';
import mongoose from 'mongoose';
import {
  getCachesFromStatement,
  saveCachePaths,
  saveCacheValues
} from 'lib/services/querybuildercache';
import { mapKeys } from 'lodash';

const objectId = mongoose.Types.ObjectId;

export const patchStatementMetadata = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: 'statement',
    actionName: 'edit',
    authInfo
  });

  const filter = {
    $and: [
      { _id: objectId(req.params.id) },
      scopeFilter
    ]
  };

  const metadata = mapDot(req.body, encodeDot);
  const model = await Statement.findOneAndUpdate(filter, {
    $set: mapKeys(metadata, (_value, key) => `metadata.${key}`)
  }, { new: true, fields: {_id: 1, organisation: 1} });
  generateQueryBuilderCaches({ metadata }, model.organisation);

  return res.status(200).send({ _id: model._id });
});

export const postStatementMetadata = catchErrors(async (req, res) => {
  const authInfo = getAuthFromRequest(req);

  const scopeFilter = await getScopeFilter({
    modelName: 'statement',
    actionName: 'edit',
    authInfo
  });

  const filter = {
    $and: [
      { _id: objectId(req.params.id) },
      scopeFilter
    ]
  };
  const metadata = mapDot(req.body, encodeDot);
  console.log('TCL: metadata', metadata);

  const update = { metadata };
  const model = await Statement.findOneAndUpdate(filter, update, { new: true, fields: {_id: 1, organisation: 1} });
  generateQueryBuilderCaches(update, model.organisation);

  return res.status(200).send({ _id: model._id });
});

const generateQueryBuilderCaches = async (model, organisation) => {
  const pathsBatch = QueryBuilderCache.collection.initializeUnorderedBulkOp();
  const valuesBatch = QueryBuilderCacheValue.collection.initializeUnorderedBulkOp();
  const caches = getCachesFromStatement(model);
  saveCachePaths(caches, organisation, pathsBatch);
  saveCacheValues(caches, organisation, valuesBatch);
  try {
    await Promise.all([
      pathsBatch.execute({ w: 0 }), // write concern set to 0 to supress warnings of duplicate key errors
      valuesBatch.execute({ w: 0 }) //  these are expected, letting mongo assert the uniqueness is the fastest way
    ]);
  } catch (err) {
    logger.error(err);
  }
}

export default {
  patchStatementMetadata,
  postStatementMetadata
};
