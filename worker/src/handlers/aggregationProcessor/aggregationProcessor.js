import { LOCK_TIMEOUT_MINUTES, AGGREGATION_PROCESSOR_QUEUE } from 'lib/constants/aggregationProcessor';
import moment from 'moment';
import AggregationProcessor from 'lib/models/aggregationProcessor';
import Statement from 'lib/models/statement';
import { get } from 'lodash';
import { publish } from 'lib/services/queue';

export const combine = (as, bs, keyFn, mergeFn) => {
  const groupedAs = as.reduce((result, a) => {
    const key = keyFn(a);
    result[key] = { a };
    return result;
  }, {});
  const groupedResults = bs.reduce((result, b) => {
    const key = keyFn(b);
    result[key] = { ...result[key], b };
    return result;
  }, groupedAs);
  return Object.entries(groupedResults).map(([model, results]) =>
    mergeFn(model, results.a, results.b)
  );
};

export const hasReachedEnd = ({ model, now }) => {
  if (
    moment(model.fromTimestamp).isSameOrBefore(moment(model.gtDate)) &&
    moment(model.toTimestamp).isSame(now)
  ) {
    return true;
  }
  return false;
};

export const getFromTimestamp = ({ model, now }) => {
  const blockSizeSeconds = moment(now).subtract(model.blockSizeSeconds, 'seconds');
  const windowSize = moment(now).subtract(model.windowSize, model.windowSizeUnits);

  if (blockSizeSeconds.isAfter(windowSize)) {
    return blockSizeSeconds;
  }

  return windowSize;
};

export const getAddFromTimestamp = ({ model, now }) => {
  if (model.toTimestamp) {
    return moment(model.toTimestamp);
  }

  return getFromTimestamp({ model, now });
};

/*
  returns undefined from to now is less than the window size
*/
export const getAddToTimestamp = ({
  model,
  now
}) => {
  const addFrom = getAddFromTimestamp({ model, now });
  const nextAddFrom = addFrom.add(model.blockSizeSeconds, 'seconds');

  if (nextAddFrom.isSameOrAfter(now)) {
    return now;
  }
  return nextAddFrom;
};

const getAddPipeline = ({
  model,
  now
}) => {
  const addPipeline = [
    { $match: {
      timestamp: {
        $gt: getAddFromTimestamp({ model, now }).toDate(),
        $lte: getAddToTimestamp({ model, now }).toDate()
      }
    } },
    ...(JSON.parse(model.pipelineString))
  ];

  return addPipeline;
};

const getSubtractPipeline = ({
  model,
  now
}) => {
  const hasSubtraction = model.fromTimestamp || model.toTimestamp;
  if (!hasSubtraction) {
    return;
  }

  const fromTimestamp = getFromTimestamp({ model, now });

  const subtractPipeline = [
    {
      $match: {
        timestamp: {
          $gte: fromTimestamp.toDate(),
          $lt: moment(model.fromTimestamp).toDate()
        }
      }
    },
    ...(JSON.parse(model.pipelineString))
  ];

  return subtractPipeline;
};

const aggregationProcessor = async ({
  aggregationProcessorId,
  publishQueue = publish,
}, done) => {
  // Attempt to aquire a lock
  const model = await AggregationProcessor.findOneAndUpdate({
    _id: aggregationProcessorId,
    $or: [
      { lockedAt: null },
      { lockedAt: { // lock has expired
        $lt: moment().subtract(LOCK_TIMEOUT_MINUTES, 'minutes').toDate()
      } }
    ]
  }, {
    lockedAt: moment().toDate()
  }, {
    new: true,
    upsert: false
  });

  if (!model) {
    // Probably locked by something else
    done();
    return;
  }
  const now = moment();

  const addPipeline = getAddPipeline({
    model,
    now
  });

  const subtractPipeline = getSubtractPipeline({
    model,
    now
  });

  const addResults = await Statement.aggregate(addPipeline);
  const subtractResults = subtractPipeline && await Statement.aggregate(subtractPipeline);

  let results;
  if (subtractResults) {
    const addSubtractResults = combine(addResults, subtractResults, result => result.model,
      (resultModel, a, b) => {
        const countA = get(a, 'count', 0);
        const countB = get(b, 'count', 0);
        const count = countA - countB;
        return {
          model: resultModel,
          count
        };
      }
    );

    results = combine(model.results, addSubtractResults, result => result.model,
      (resultModel, a, b) => {
        const countA = get(a, 'count', 0);
        const countB = get(b, 'count', 0);
        const count = countA + countB;
        return {
          model: resultModel,
          count
        };
      }
    );
  } else {
    results = combine(model.results || [], addResults,
      result => result.model,
      (resultModel, a, b) => {
        const countA = get(a, 'count', 0);
        const countB = get(b, 'count', 0);
        const count = countA + countB;
        return {
          model: resultModel,
          count
        };
      }
    );
  }

  const fromTimestamp = getFromTimestamp({ model, now });
  const toTimestamp = getAddToTimestamp({ model, now });

  // TODO: write the results
  const newModel = await AggregationProcessor.findOneAndUpdate({
    _id: aggregationProcessorId
  }, {
    $unset: {
      lockedAt: '',
    },
    fromTimestamp,
    toTimestamp,
    results
  }, {
    new: true,
    upsert: false
  });

  if (!hasReachedEnd({ model: newModel, now })) {
    publishQueue({
      queueName: AGGREGATION_PROCESSOR_QUEUE,
      payload: {
        aggregationProcessorId
      }
    });
  }

  done();
  return results;
};

export default aggregationProcessor;
