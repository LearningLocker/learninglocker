import catchErrors from 'api/controllers/utils/catchErrors';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import AggregationProcessor from 'lib/models/aggregationProcessor';
import { publish } from 'lib/services/queue';
import sha1 from 'sha1';
import { get, keys, isObject, filter } from 'lodash';
import { AGGREGATION_PROCESSOR_QUEUE } from 'lib/constants/aggregationProcessor';
import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import encode$oid from 'lib/helpers/encode$oid';

export const findOrCreateAggregationProcessor = async ({
  pipelineString,
  pipelineHash,
  windowSize,
  windowSizeUnits,
  previousWindowSize,
  organisation,
  lrs_id,
  useWindowOptimization
}) => {
  const model = await AggregationProcessor.findOneAndUpdate({
    organisation,
    lrs_id,
    pipelineHash,
    windowSize,
    windowSizeUnits,
    previousWindowSize
  }, {
    pipelineString,
    useWindowOptimization
  }, {
    new: true,
    upsert: true
  });

  return model;
};

const canUseWindowOptimization = (pipeline) => {
  const groupStages = filter(pipeline, value => keys(value)[0] === '$group');
  if (groupStages.length !== 1) {
    return false;
  }

  const group = Object.entries(groupStages[0].$group).find(([key, value]) => {
    if (
      isObject(value) &&
      keys(value).length === 1 &&
      (
        keys(value)[0] === '$sum' ||
        keys(value)[0] === '$first'
      ) ||
      key === '_id'
    ) {
      return false;
    }
    return true;
  });

  if (group) {
    return false;
  }

  return true;
};

export const aggregationProcessorInitialise = catchErrors(async (req, res) => {
  const authInfo = req.user.authInfo || {};
  const organisation = getOrgFromAuthInfo(authInfo);

  const pipeline = req.body.pipeline;

  const scopedFilter = await getScopeFilter({
    modelName: 'aggregationProcessor',
    actionName: 'view',
    authInfo,
    allowDashboardAccess: true
  });
  pipeline.unshift({
    $match: encode$oid(scopedFilter)
  });

  const pipelineString = JSON.stringify(pipeline);
  const hash = pipelineString.length > 40 ? sha1(pipelineString) : pipelineString;

  const windowSize = req.query.timeIntervalSinceToday;
  const windowSizeUnits = req.query.timeIntervalUnits;
  const previousWindowSize = req.query.timeIntervalSincePreviousTimeInterval;

  const useWindowOptimization = canUseWindowOptimization(pipeline);

  const model = await findOrCreateAggregationProcessor({
    organisation,
    lrs_id: get(authInfo, ['client', 'lrs_id']),
    pipelineHash: hash,
    pipelineString,
    windowSize,
    windowSizeUnits,
    previousWindowSize,
    useWindowOptimization
  });

  // Send it to the queue
  await publish({
    queueName: AGGREGATION_PROCESSOR_QUEUE,
    payload: {
      aggregationProcessorId: model._id
    }
  });

  res.status(200).send(model);
});
