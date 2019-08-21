import catchErrors from 'api/controllers/utils/catchErrors';
import getOrgFromAuthInfo from 'lib/services/auth/authInfoSelectors/getOrgFromAuthInfo';
import AggregationProcessor from 'lib/models/aggregationProcessor';
import { publish } from 'lib/services/queue';
import sha1 from 'sha1';
import { AGGREGATION_PROCESSOR_QUEUE } from 'lib/constants/aggregationProcessor';

// const LOCK_TIMEOUT_MINUTES = 10;

export const findOrCreateAggregationProcessor = async ({
  pipelineString,
  pipelineHash,
  windowSize,
  windowSizeUnits,
  organisation
}) => {
  const model = await AggregationProcessor.findOneAndUpdate({
    organisation,
    pipelineHash,
    windowSize,
    windowSizeUnits
    // $or: [
    //   { lockedAt: null },
    //   { lockedAt: {
    //     $gte: moment().subtract(LOCK_TIMEOUT_MINUTES, 'minutes').toDate()
    //   } }
    // ]
  }, {
    pipelineString
  }, {
    new: true,
    upsert: true
  });

  return model;
};

// timeIntervalSinceToday
// timeIntervalUnits

export const aggregationProcessorInitialise = catchErrors(async (req, res) => {
  const authInfo = req.user.authInfo || {};
  const organisation = getOrgFromAuthInfo(authInfo);

  const pipeline = req.body.pipeline;

  const pipelineKeyString = JSON.stringify(pipeline);

  const pipelineString = JSON.stringify(pipeline);
  const hash = pipelineString.length > 40 ? sha1(pipelineString) : pipelineString;

  // const windowSize = moment().diff(gtDate, 'days');
  const windowSize = req.query.timeIntervalSinceToday;
  const windowSizeUnits = req.query.timeIntervalUnits;

  const model = await findOrCreateAggregationProcessor({
    organisation,
    pipelineHash: hash,
    pipelineString: pipelineKeyString,
    windowSize,
    windowSizeUnits
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
