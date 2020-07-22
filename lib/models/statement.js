/* eslint-disable import/no-mutable-exports */
import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import moment from 'moment';
import sha1 from 'sha1';
import defaultTo from 'lodash/defaultTo';
import boolean from 'boolean';
import Promise, { delay } from 'bluebird';
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
import logger from 'lib/logger';
import Lrs from 'lib/models/lrs';

const ALLOW_AGGREGATION_DISK_USE = boolean(defaultTo(process.env.ALLOW_AGGREGATION_DISK_USE, true));
const AGGREGATION_CACHE_SECONDS = defaultTo(Number(process.env.AGGREGATION_CACHE_SECONDS), 300);
const AGGREGATION_REFRESH_AT_SECONDS = defaultTo(Number(process.env.AGGREGATION_REFRESH_AT_SECONDS), 120);
const ASYNC_AGGREGATION_WAITING_MS = defaultTo(Number(process.env.ASYNC_AGGREGATION_WAITING_MS), 0);
const ASYNC_AGGREGATION_CACHE_SECONDS = defaultTo(Number(process.env.ASYNC_AGGREGATION_CACHE_SECONDS), 604800); // 604800 seconds = 7 days
const ASYNC_AGGREGATION_TIMEOUT_MS = defaultTo(Number(process.env.ASYNC_AGGREGATION_TIMEOUT_MS), 0);
const ASYNC_AGGREGATION_REFRESH_AFTER_SECONDS = defaultTo(Number(process.env.ASYNC_AGGREGATION_REFRESH_AFTER_SECONDS), 60); // 1 minute
const MAX_TIME_MS = defaultTo(Number(process.env.MAX_TIME_MS), 0);

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
    errorInfo: Object,
  }],
  pendingForwardingQueue: [{
    type: mongoose.Schema.ObjectId,
    ref: 'StatementForwarding'
  }],
  completedForwardingQueue: [{
    type: mongoose.Schema.ObjectId,
    ref: 'StatementForwarding'
  }],
  hash: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
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

schema.post('remove', async (statement, next) => {
  await Lrs.decrementStatementCount(statement.lrs_id);
  next();
});

/**
 * @param {*} - {
 *                pipeline
 *                skip
 *                limit
 *                batchSize
 *                maxTimeMS
 *              }
 * @return {Promise}
 */
const streamAggregation = ({ pipeline, skip, limit, batchSize, maxTimeMS }) => {
  let query = Statement
    .aggregate(pipeline)
    .read('secondaryPreferred')
    .allowDiskUse(ALLOW_AGGREGATION_DISK_USE);
  if (skip !== -1) query = query.skip(skip);
  if (limit !== -1) query = query.limit(limit);
  if (!query.options) {
    query.options = {};
  }
  query.options.maxTimeMS = maxTimeMS;

  return Promise.resolve(query
    .cursor({ batchSize })
    .exec()
  );
};

const getCachedAggregation = ({ client, key }) => client.get(key);

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
    sampleSize = undefined
  },
  cb = () => { }
) {
  return parseQuery(pipeline, { authInfo }).then(async (parsedPipeline) => {
    // filter the pipeline to use the auth's organisation
    const modelName = 'statement';
    const actionName = 'view';
    const scopedFilter = await getScopeFilter({
      modelName,
      actionName,
      authInfo,
      allowDashboardAccess: true
    });
    const organisation = getOrgFromAuthInfo(authInfo);

    parsedPipeline.unshift({
      $match: scopedFilter
    });

    if (sampleSize > 0) {
      parsedPipeline.unshift({ $sample: { size: sampleSize } });
    }
    const finalPipeline = removeEmptyMatch(parsedPipeline);

    if (getStream) {
      return streamAggregation({
        pipeline: finalPipeline,
        skip,
        limit,
        batchSize,
        maxTimeMS,
      }).then(stream => cb(null, stream));
    }

    if (cache === false) {
      return streamAggregation({
        pipeline: finalPipeline, skip, limit, batchSize, maxTimeMS
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

    return redisClient.ttl(dataKey).then((dataKeyTTL) => {
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

export const mapDot = (data, converter = decodeDot) => {
  if (isPlainObject(data)) {
    const mappedData = mapKeys(data, (value, key) => converter(key));
    return mapValues(mappedData, val => mapDot(val, converter));
  }

  if (isArray(data)) {
    return data.map(val => mapDot(val, converter));
  }

  return data;
};

schema.statics.postFetchMap = function postFetchMap(statement) {
  statement.statement = mapDot(statement.statement);
  return statement;
};

/**
 * build redis key prefix for async aggregation
 *
 * @param {string} organisationId
 * @param {array} pipeline
 * @param {number} skip
 * @param {number} limit
 * @returns {string}
 */
export const buildRedisKeyPrefix = (organisationId, pipeline, skip, limit) =>
  cachePrefix(`${organisationId}-AGGREGATION-ASYNC-${sha1(JSON.stringify(pipeline))}-${skip}-${limit}`);

/**
 * @param {*} redisClient
 * @param {string} organisationId
 * @param {array} pipeline
 * @param {object} options
 * @returns {void}
 */
export const runAggregationAsync = async (
  redisClient,
  organisationId,
  pipeline,
  skip,
  limit,
) => {
  const prefix = buildRedisKeyPrefix(organisationId, pipeline, skip, limit);
  const setIsRunning = () => redisClient.setex(`${prefix}-QUERY-RUNNING`, 10, 1);

  // Set the startedAt date into Redis
  await redisClient.set(`${prefix}-STARTED-AT`, moment().format('YYYY-MM-DD HH:mm:ss.SSSZ'));

  // "lock" the query in Redis
  await setIsRunning();
  const isRunningInterval = setInterval(setIsRunning, 5000);

  try {
    const results = await streamAggregation({
      pipeline,
      skip,
      limit,
      batchSize: 100,
      maxTimeMS: ASYNC_AGGREGATION_TIMEOUT_MS,
    }).then(streamToStringResult);

    const startedAt = await redisClient.get(`${prefix}-STARTED-AT`);
    const completedAt = moment().format('YYYY-MM-DD HH:mm:ss.SSSZ');

    await Promise.all([
      redisClient.setex(`${prefix}-STARTED-AT`, ASYNC_AGGREGATION_CACHE_SECONDS, startedAt),
      redisClient.setex(`${prefix}-COMPLETED-AT`, ASYNC_AGGREGATION_CACHE_SECONDS, completedAt),
      redisClient.setex(`${prefix}-RESULTS`, ASYNC_AGGREGATION_CACHE_SECONDS, results),
    ]);
  } catch (err) {
    logger.error(err);
    await Promise.all([
      redisClient.del(`${prefix}-STARTED-AT`),
      redisClient.del(`${prefix}-COMPLETED-AT`),
      redisClient.del(`${prefix}-RESULTS`),
    ]);
  }

  // "unlock" the query
  clearInterval(isRunningInterval);
  await redisClient.del(`${prefix}-QUERY-RUNNING`);
};

/**
 * @param {*} redisClient
 * @param {string} prefix
 * @param {string|null} sinceAt
 * @returns {Promise} aggregation result and status
 */
export const getAggregationStatus = async (redisClient, prefix, sinceAt) => {
  const [startedAt, completedAt, results, isRunning] = await Promise.all([
    redisClient.get(`${prefix}-STARTED-AT`),
    redisClient.get(`${prefix}-COMPLETED-AT`),
    redisClient.get(`${prefix}-RESULTS`),
    (async () => boolean(await redisClient.get(`${prefix}-QUERY-RUNNING`)))(),
  ]);

  if (sinceAt && completedAt && moment(completedAt).isSameOrBefore(moment(sinceAt))) {
    return {
      result: null,
      startedAt,
      completedAt: null,
      isRunning,
    };
  }

  return {
    result: results && JSON.parse(results),
    startedAt,
    completedAt,
    isRunning,
  };
};

/**
 * @param {array} pipeline
 * @param {object} authInfo
 * @returns {array} decorated pipeline
 */
export const decoratePipeline = async (pipeline, authInfo, allowDashboardAccess) => {
  const parsedPipeline = await parseQuery(pipeline, { authInfo });

  const scopedFilter = await getScopeFilter({
    modelName: 'statement',
    actionName: 'view',
    authInfo,
    allowDashboardAccess
  });

  parsedPipeline.unshift({
    $match: scopedFilter
  });

  return removeEmptyMatch(parsedPipeline);
};

const hasFreshCache = (completedAt) => {
  if (!completedAt) {
    return false;
  }
  const cacheExpiryTime = moment(completedAt).add(ASYNC_AGGREGATION_REFRESH_AFTER_SECONDS, 'seconds');
  return moment().isSameOrBefore(cacheExpiryTime);
};

/**
 * @param {*} authInfo
 * @param {array} basePipeline
 * @param {number} skip
 * @param {number} limit
 * @param {string|null} sinceAt
 * @returns {Promise}
 */
export const aggregateAsync = async (
  authInfo,
  basePipeline,
  skip,
  limit,
  sinceAt,
) => {
  const redisClient = redis.createClient();
  const organisationId = getOrgFromAuthInfo(authInfo);
  const pipeline = await decoratePipeline(basePipeline, authInfo, true);

  const prefix = buildRedisKeyPrefix(organisationId, pipeline, skip, limit);

  const status = await getAggregationStatus(redisClient, prefix, sinceAt);
  const { completedAt, isRunning } = status;

  // If "no cache and is running" or "has fresh cache"
  if (isRunning || hasFreshCache(completedAt)) {
    return status;
  }

  // Do not await!
  runAggregationAsync(redisClient, organisationId, pipeline, skip, limit);

  await delay(ASYNC_AGGREGATION_WAITING_MS);

  const delayedResult = await getAggregationStatus(redisClient, prefix, sinceAt);
  return delayedResult;
};

schema.statics.aggregateAsync = aggregateAsync;


export { schema };

Statement = getConnection().model('Statement', schema, 'statements');
export default Statement;
