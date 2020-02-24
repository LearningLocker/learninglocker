import { AGGREGATION_PROCESSOR_QUEUE, LOCK_TIMEOUT_MINUTES } from 'lib/constants/aggregationProcessor';
import moment from 'moment';
import AggregationProcessor from 'lib/models/aggregationProcessor';
import Statement from 'lib/models/statement';
import { get, isObject, omit } from 'lodash';
import { publish } from 'lib/services/queue';
import convert$oid from 'lib/helpers/convert$oid';

export const combine = (as, bs, keyFnIn, mergeFn) => {
  const keyFn = (item) => {
    const keyValue = keyFnIn(item);
    return isObject(keyValue) ? JSON.stringify(keyValue) : keyValue;
  };
  const groupedAs = as.reduce((result, a) => {
    const key = keyFn(a);
    result[key] = { key, a };
    return result;
  }, {});

  const groupedResults = bs.reduce((result, b) => {
    const key = keyFn(b);
    result[key] = { ...result[key], b, key };
    return result;
  }, groupedAs);

  return Object.entries(groupedResults).map(([, results]) =>
    mergeFn(results.key, results.a, results.b)
  );
};

export const hasReachedEnd = ({ model, now }) => (
  moment(model.fromTimestamp).isSame(moment(model.gtDate)) &&
  moment(model.toTimestamp).isSame(now)
);

export const getFromTimestamp = ({ model, now }) => {
  if (model.useWindowOptimization === false) {
    return moment(model.gtDate);
  }

  if (!model.fromTimestamp || moment(model.fromTimestamp).isAfter(moment(model.gtDate))) {
    const fromTimestamp = moment(model.fromTimestamp || now).subtract(model.blockSizeSeconds, 'seconds');

    if (fromTimestamp.isAfter(moment(model.gtDate))) {
      return fromTimestamp;
    }

    return moment(model.gtDate);
  } else if (moment(model.fromTimestamp).isBefore(moment(model.gtDate))) {
    const fromTimestamp = moment(model.fromTimestamp || now).add(model.blockSizeSeconds, 'seconds');

    if (fromTimestamp.isBefore(moment(model.gtDate))) {
      return fromTimestamp;
    }
  }

  return moment(model.gtDate);
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
  if (model.useWindowOptimization === false) {
    return now;
  }
  const addFrom = getAddFromTimestamp({ model, now });
  const nextAddFrom = addFrom.add(model.blockSizeSeconds, 'seconds');

  if (nextAddFrom.isSameOrAfter(now)) {
    return now;
  }
  return nextAddFrom;
};

const parsePipelineString = (pipelineString) => {
  const pipeline = JSON.parse(pipelineString);
  return convert$oid(pipeline);
};

const getAddPipeline = ({
  model,
  now
}) => {
  if (!model.useWindowOptimization) {
    return [
      {
        $match: {
          $or: [
            {
              timestamp: {
                $gte: moment(model.gtDate).toDate(),
                $lt: moment(model.fromTimestamp || now).toDate()
              }
            }
          ]
        },
      },
      ...(parsePipelineString(model.pipelineString))
    ];
  }

  const addToFrontPipeline = {
    $gt: getAddFromTimestamp({ model, now }).toDate(),
    $lte: getAddToTimestamp({ model, now }).toDate()
  };

  let addToEnd = {};

  if (moment(model.fromTimestamp).isAfter(moment(model.gtDate))) {
    addToEnd = {
      $gte: moment(getFromTimestamp({ model, now })).toDate(),
      $lt: moment(model.fromTimestamp || now).toDate()
    };
  }

  return [
    {
      $match: {
        $or: [
          { timestamp: addToFrontPipeline },
          { timestamp: addToEnd }
        ]
      }
    },
    ...(parsePipelineString(model.pipelineString))
  ];
};

const getSubtractPipeline = ({
  model,
  now
}) => {
  const hasSubtraction = (model.fromTimestamp || model.toTimestamp) &&
    moment(model.fromTimestamp).isBefore(moment(model.gtDate));

  if (!hasSubtraction) {
    return;
  }

  const newFromTimestamp = getFromTimestamp({ model, now });

  return [
    {
      $match: {
        timestamp: {
          $gte: moment(model.fromTimestamp).toDate(),
          $lt: newFromTimestamp.toDate()
        }
      }
    },
    ...(parsePipelineString(model.pipelineString))
  ];
};

const getWindowSize = (model) => {
  if (model.previousWindowSize) {
    return model.previousWindowSize;
  }
  return model.windowSize;
};

/**
 * @param {string} aggregationProcessorId
 * @param publishQueue
 * @param now
 * @param done
 * @returns {Promise<*>}
 */
const aggregationProcessor = async (
  {
    aggregationProcessorId,
    publishQueue = publish,
    now // For testing
  },
  done
) => {
  // Attempt to acquire a lock
  const model = await AggregationProcessor.findOneAndUpdate(
    {
      _id: aggregationProcessorId,
      $or: [
        { lockedAt: null },
        {
          lockedAt: { // lock has expired
            $lt: moment()
              .subtract(LOCK_TIMEOUT_MINUTES, 'minutes')
              .toDate()
          }
        }
      ]
    },
    { lockedAt: moment().toDate() },
    {
      new: true,
      upsert: false
    }
  );

  if (!model) {
    // Probably locked by something else
    done();

    return;
  }

  if (!now) {
    if (!model.previousWindowSize) {
      now = moment();
    } else if (model.previousWindowSize) {
      now = moment().subtract(model.windowSize, model.windowSizeUnits);
    }
  }

  model.gtDate = moment(now).subtract(getWindowSize(model), model.windowSizeUnits);

  const addPipeline = getAddPipeline({
    model,
    now
  });

  const subtractPipeline = getSubtractPipeline({
    model,
    now
  });

  const addResultsPromise = Statement.aggregate(addPipeline);
  const subtractResultsPromise = model.useWindowOptimization && subtractPipeline && Statement.aggregate(subtractPipeline);


  const [addResults, subtractResults] =
    await Promise.all([addResultsPromise, subtractResultsPromise]);

  let results;

  if (subtractResults && model.useWindowOptimization) {
    const addSubtractResults = combine(addResults, subtractResults, result => result.model,
      (resultModel, a, b) => {
        const countA = get(a, 'count', 0);
        const countB = get(b, 'count', 0);
        const count = countA - countB;
        const extraA = omit(a, 'count');
        const extraB = omit(b, 'count');
        return {
          ...extraA,
          ...extraB,
          count
        };
      }
    );

    results = combine(model.results, addSubtractResults, result => result.model,
      (resultModel, a, b) => {
        const countA = get(a, 'count', 0);
        const countB = get(b, 'count', 0);
        const count = countA + countB;
        const extraA = omit(a, 'count');
        const extraB = omit(b, 'count');
        return {
          ...extraA,
          ...extraB,
          count
        };
      }
    );
  } else if (!model.useWindowOptimization) {
    results = addResults;
  } else {
    results = combine(model.results || [], addResults,
      result => result.model,
      (resultModel, a, b) => {
        const countA = get(a, 'count', 0);
        const countB = get(b, 'count', 0);
        const count = countA + countB;
        const extraA = omit(a, 'count');
        const extraB = omit(b, 'count');
        return {
          ...extraA,
          ...extraB,
          count
        };
      }
    );
  }

  const fromTimestamp = getFromTimestamp({ model, now });
  const toTimestamp = getAddToTimestamp({ model, now });

  const newModel = await AggregationProcessor.findOneAndUpdate(
    {
      _id: aggregationProcessorId
    },
    {
      $unset: {
        lockedAt: '',
      },
      fromTimestamp: fromTimestamp.toDate(),
      toTimestamp: toTimestamp.toDate(),
      gtDate: model.gtDate,
      results
    },
    {
      new: true,
      upsert: false
    }
  );

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
