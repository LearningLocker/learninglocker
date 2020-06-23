import getAuthFromRequest from 'lib/helpers/getAuthFromRequest';
import getFromQuery from 'api/utils/getFromQuery';
import getJSONFromQuery from 'api/utils/getJSONFromQuery';
import * as statementsService from 'lib/services/statements';
import catchErrors from 'api/controllers/utils/catchErrors';
import defaultTo from 'lodash/defaultTo';

const MAX_TIME_MS = defaultTo(Number(process.env.MAX_TIME_MS), 0);

const aggregate = (req) => {
  const authInfo = req.user.authInfo || {};
  const limit = Number(req.query.limit) || -1;
  const skip = Number(req.query.skip) || 0;
  const cache = (!!req.query.cache && req.query.cache !== 'false') || false;
  const maxTimeMS = Number(req.query.maxTimeMS) || MAX_TIME_MS;
  const pipeline = JSON.parse(req.query.pipeline);
  const sampleSize = Number(req.query.sampleSize) || undefined;
  const out = statementsService.aggregate({
    authInfo,
    limit,
    skip,
    cache,
    maxTimeMS,
    pipeline,
    sampleSize
  });
  return out;
};

const aggregateStatements = catchErrors(async (req, res) => {
  const results = await aggregate(req);
  res.set('Content-Type', 'application/json');
  res.write(results);
  return res.end();
});

/**
 * extract parameters for aggregateAsync from request parameters.
 * Some of parameters have default value.
 *
 * @param {*} req
 * @returns {object}
 */
const extractParamsForAggregateAsync = req => ({
  authInfo: req.user.authInfo || {},
  pipeline: JSON.parse(req.query.pipeline),
  skip: Number(req.query.skip) || 0,
  limit: Number(req.query.limit) || -1,
  sinceAt: req.query.sinceAt || null,
});

const aggregateAsync = async (req) => {
  const params = extractParamsForAggregateAsync(req);
  const resultsAndStatus = await statementsService.aggregateAsync(params);
  return JSON.stringify({
    result: resultsAndStatus.result,
    status: {
      startedAt: resultsAndStatus.startedAt,
      completedAt: resultsAndStatus.completedAt,
      isRunning: resultsAndStatus.isRunning,
    },
  });
};

const aggregateAsyncStatements = catchErrors(async (req, res) => {
  const result = await aggregateAsync(req);
  res.set('Content-Type', 'application/json');
  res.write(result);
  return res.end();
});

const aggregateStatementsV1 = catchErrors(async (req, res) => {
  const results = await aggregate(req);
  const strRes = `{ "waitedMS": 0, "result": ${results}, "ok": 1 }`;
  res.set('Content-Type', 'application/json');
  res.write(strRes);
  return res.end();
});

const countStatements = catchErrors(async (req, res) => {
  const filter = getJSONFromQuery(
    req,
    'filter',
    getJSONFromQuery(req, 'query', {})
  );
  const maxTimeMS = getFromQuery(req, 'maxTimeMS', MAX_TIME_MS, Number);
  const hint = getJSONFromQuery(req, 'hint', null);
  const authInfo = getAuthFromRequest(req);

  const count = await statementsService.countStatements({
    authInfo,
    filter,
    maxTimeMS,
    hint
  });

  return res.status(200).send({ count });
});

export default {
  aggregate: aggregateStatements,
  aggregateAsync: aggregateAsyncStatements,
  v1aggregate: aggregateStatementsV1,
  count: countStatements
};
