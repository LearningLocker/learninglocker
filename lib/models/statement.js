/* eslint-disable import/no-mutable-exports */
import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import sha1 from 'sha1';
import defaultTo from 'lodash/defaultTo';
import boolean from 'boolean';
import Promise from 'bluebird';
import keys from 'lodash/keys';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';
import mapValues from 'lodash/mapValues';
import mapKeys from 'lodash/mapKeys';
import removeEmptyMatch from 'lib/helpers/removeEmptyMatch';
import scopeChecks from 'lib/models/plugins/scopeChecks';
import * as scopes from 'lib/constants/scopes';
import cachePrefix from 'lib/helpers/cachePrefix';
import addCRUDFunctions from 'lib/models/plugins/addCRUDFunctions';
import * as redis from 'lib/connections/redis';
import parseQuery from 'lib/helpers/parseQuery';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import filterByOrg from 'lib/models/plugins/filterByOrg';
import decodeDot from 'lib/helpers/decodeDot';

const ALLOW_AGGREGATION_DISK_USE = boolean(defaultTo(process.env.ALLOW_AGGREGATION_DISK_USE, true));
const AGGREGATION_CACHE_SECONDS = defaultTo(Number(process.env.AGGREGATION_CACHE_SECONDS), 300);
const AGGREGATION_REFRESH_AT_SECONDS = defaultTo(Number(process.env.AGGREGATION_REFRESH_AT_SECONDS), 120);
const MAX_TIME_MS = defaultTo(Number(process.env.MAX_TIME_MS), 0);
const MAX_SCAN = defaultTo(Number(process.env.MAX_SCAN), 0);

const objectId = mongoose.Types.ObjectId;

let Statement;
const schema = new mongoose.Schema({
  lrs: { type: mongoose.Schema.Types.Mixed },
  organisation: { type: mongoose.Schema.ObjectId, ref: 'Organisation' },
  lrs_id: { type: mongoose.Schema.ObjectId, ref: 'Lrs' },
  person: { _id: { type: mongoose.Schema.ObjectId, ref: 'Persona' }, display: { type: String } },
  personaIdentifier: { type: mongoose.Schema.ObjectId, ref: 'PersonaIdentifier' },
  active: { type: Boolean },
  voided: { type: Boolean },
  timestamp: { type: Date },
  stored: { type: Date },
  refs: { type: mongoose.Schema.Types.Mixed }, // TODO, find type this should actually be
  statement: { type: mongoose.Schema.Types.Mixed },
  client_id: { type: mongoose.Schema.Types.String },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  completedQueues: [{ type: String }],
  processingQueues: [{ type: String }],

  deadForwardingQueue: [{
    type: mongoose.Schema.ObjectId,
    ref: 'StatementForwarding'
  }],
  failedForwardingLog: [{
    statementForwarding_id: {
      type: mongoose.Schema.ObjectId,
      ref: 'StatementForwarding'
    },
    timestamp: Date,
    message: String,
    messageBody: String,
  }],
  pendingForwardingQueue: [{
    type: mongoose.Schema.ObjectId,
    ref: 'StatementForwarding'
  }],
  completedForwardingQueue: [{
    type: mongoose.Schema.ObjectId,
    ref: 'StatementForwarding'
  }]
});

schema.index({ organisation: 1, timestamp: -1, _id: 1 });

schema.readScopes = keys(scopes.USER_SCOPES).concat([
  scopes.XAPI_ALL,
  scopes.XAPI_READ,
  scopes.XAPI_STATEMENTS_READ,
  scopes.XAPI_STATEMENTS_READ_MINE,
]);
schema.writeScopes = keys(scopes.USER_SCOPES).concat([
  scopes.XAPI_ALL,
  scopes.XAPI_STATEMENTS_WRITE,
]);

schema.plugin(scopeChecks);
schema.plugin(filterByOrg);
schema.plugin(addCRUDFunctions);

const streamAggregation = ({ pipeline, skip, limit, batchSize, maxTimeMS, maxScan }) => {
  let query = Statement.aggregate(pipeline).allowDiskUse(ALLOW_AGGREGATION_DISK_USE);
  if (skip !== -1) query = query.skip(skip);
  if (limit !== -1) query = query.limit(limit);
  if (!query.options) {
    query.options = {};
  }
  query.options.maxTimeMS = maxTimeMS;
  query.options.maxScan = maxScan;

  return Promise.resolve(query
    .cursor({ batchSize })
    .exec()
    .stream()
  );
};

const getCachedAggregation = ({ client, key }) => client.getAsync(key);

const streamToStringResult = (stream) => {
  let firstItem = true;
  let writingDocs = false;

  let result = '';

  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    stream.on('data', (doc) => {
      // Start the JSON array or separate the next element
      if (firstItem) {
        firstItem = false;
        writingDocs = true;
        result += '[';
      } else {
        firstItem = false;
        result += ',';
      }
      result += JSON.stringify(Statement.postFetchMap(doc));
    });
    stream.on('end', () => {
      result += writingDocs ? ']' : '[]';
      resolve(result);
    });
  });
};

const setCachedAggregation = ({ client, dataKey, isRunningKey, stream }) =>
  streamToStringResult(stream).then((result) => {
    client.setex(dataKey, AGGREGATION_CACHE_SECONDS, result);
    client.del(isRunningKey);
    return result;
  }).catch((err) => {
    client.del(isRunningKey);
    return Promise.reject(err);
  });

/**
 * returns a cursor aggregating the statements collection
 * filtered by the lrss visisble to the authenticated client
 * @param  {Object}   client   authenticating client
 * @param  {Object}   pipeline aggregation pipeline to apply
 * @param  {Function} cb   cb to apply when done
 * @return {Stream}   stream
 */
schema.statics.aggregateByAuth = function aggregateByAuth(
    authInfo,
    pipeline = [],
    {
      skip = 0,
      limit = -1,
      cache = false,
      batchSize = 100,
      getStream = false,
      maxTimeMS = MAX_TIME_MS,
      maxScan = MAX_SCAN,
    },
    cb = () => {}
  ) {
  return parseQuery(pipeline).then(async (parsedPipeline) => {
    // filter the pipeline to use the auth's organisation
    const modelName = 'statement';
    const actionName = 'view';
    const scopedFilter = await getScopeFilter({ modelName, actionName, authInfo });
    const organisation = getOrgFromAuthInfo(authInfo);

    parsedPipeline.unshift({
      $match: scopedFilter
    });

    // if we are using client based auth, filter by the lrs_id (if exist)
    if (authInfo.client && authInfo.client.lrs_id) {
      parsedPipeline.unshift({ $match: { lrs_id: objectId(authInfo.client.lrs_id) } });
    }
    const finalPipeline = removeEmptyMatch(parsedPipeline);

    if (getStream) {
      return streamAggregation({
        pipeline: finalPipeline,
        skip,
        limit,
        batchSize,
        maxTimeMS,
        maxScan,
      }).then(stream => cb(null, stream));
    }

    if (cache === false) {
      return streamAggregation({
        pipeline: finalPipeline, skip, limit, batchSize, maxTimeMS, maxScan
      }).then(stream =>
        streamToStringResult(stream)
      ).then((result) => {
        cb(null, result);
      });
    }

    const redisClient = redis.createClient();
    const redisKey = cachePrefix(`${organisation}-AGGREGATION-${sha1(JSON.stringify(finalPipeline))}-${skip}-${limit}`);
    const dataKey = `${redisKey}-DATA`;
    const isRunningKey = `${redisKey}-RUNNING`;

    return redisClient.ttlAsync(dataKey).then((dataKeyTTL) => {
      let cachedStreamPromise;
      let streamPromise;
      if (dataKeyTTL >= 5) {
        cachedStreamPromise = getCachedAggregation({ client: redisClient, key: dataKey });
      }
      if (dataKeyTTL <= AGGREGATION_REFRESH_AT_SECONDS) {
        redisClient.setex(isRunningKey, 300, 1);
        streamPromise = streamAggregation({
          pipeline: finalPipeline, skip, limit, batchSize
        }).then(stream =>
          setCachedAggregation({ client: redisClient, dataKey, isRunningKey, stream })
        );
      }
      return dataKeyTTL >= 5 ? cachedStreamPromise : streamPromise;
    })
    .then((stringResult) => {
      cb(null, stringResult);
    });
  }).catch(cb);
};

const mapDot = (data) => {
  if (isPlainObject(data)) {
    const mappedData = mapKeys(data, (value, key) => decodeDot(key));
    return mapValues(mappedData, mapDot);
  }

  if (isArray(data)) {
    return data.map(mapDot);
  }

  return data;
};

schema.statics.postFetchMap = function postFetchMap(statement) {
  statement.statement = mapDot(statement.statement);
  return statement;
};

Statement = getConnection().model('Statement', schema, 'statements');
export default Statement;
