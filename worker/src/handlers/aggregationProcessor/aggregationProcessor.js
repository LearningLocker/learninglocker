import {
  AGGREGATION_PROCESSOR_QUEUE,
  LOCK_TIMEOUT_MINUTES,
  AGGREGATION_TIMEOUT_MS
} from 'lib/constants/aggregationProcessor';
import moment from 'moment';
import AggregationProcessor from 'lib/models/aggregationProcessor';
import Statement from 'lib/models/statement';
import { get, isObject, omit } from 'lodash';
import { publish } from 'lib/services/queue';
import convert$oid from 'lib/helpers/convert$oid';
import convert$dte from 'lib/helpers/convert$dte';
import convertStatementTimestamp from 'lib/helpers/convertStatementTimestamp';
import remove$out from 'lib/helpers/remove$out';

/**
 * @param as
 * @param bs
 * @param keyFnIn
 * @param mergeFn
 * @returns {*[]}
 */
export const combine = (as, bs, keyFnIn, mergeFn) => {
  const keyFn = (item) => {
    const keyValue = keyFnIn(item);

    return isObject(keyValue) ? JSON.stringify(keyValue) : keyValue;
  };

  const groupedAs = as.reduce(
    (result, a) => {
      const key = keyFn(a);
      result[key] = { key, a };

      return result;
    },
    {}
  );

  const groupedResults = bs.reduce(
    (result, b) => {
      const key = keyFn(b);
      result[key] = { ...result[key], b, key };

      return result;
    },
    groupedAs
  );

  return Object
    .entries(groupedResults)
    .map(([, results]) => mergeFn(results.key, results.a, results.b));
};

/**
 * @param {'add' | 'subtract'} operation
 * @returns {function(*, *=, *=): *}
 */
const mergeResultsFnConstructor = (operation = 'add') => {
  /**
   * @param resultModel
   * @param a
   * @param b
   * @returns {*}
   */
  const mergeResults = (resultModel, a, b) => {
    const countA = get(a, 'count', 0);
    const countB = get(b, 'count', 0);
    const countResult = {
      add: countA + countB,
      subtract: countA - countB,
    };
    const count = countResult[operation];
    const extraA = omit(a, 'count');
    const extraB = omit(b, 'count');

    return {
      ...extraA,
      ...extraB,
      count
    };
  };

  return mergeResults;
};

/**
 * @param {AggregationProcessor} model
 * @param {moment.Moment} now
 * @returns {boolean}
 */
export const hasReachedEnd = ({ model, now }) => {
  const out = moment(model.fromTimestamp).isSame(moment(model.greaterThanDate)) &&
    moment(model.toTimestamp).isSame(now);
  return out;
};

/**
 * @param {AggregationProcessor} model
 * @param {moment.Moment} now
 * @returns {moment.Moment}
 */
export const getFromTimestamp = ({ model, now }) => {
  if (model.useWindowOptimization === false) {
    return moment(model.greaterThanDate);
  }

  if (!model.fromTimestamp || moment(model.fromTimestamp).isAfter(moment(model.greaterThanDate))) {
    const fromTimestamp = moment(model.fromTimestamp || now).subtract(model.blockSizeSeconds, 'seconds');

    if (fromTimestamp.isAfter(moment(model.greaterThanDate))) {
      return fromTimestamp;
    }

    return moment(model.greaterThanDate);
  } else if (moment(model.fromTimestamp).isBefore(moment(model.greaterThanDate))) {
    const fromTimestamp = moment(model.fromTimestamp || now).add(model.blockSizeSeconds, 'seconds');

    if (fromTimestamp.isBefore(moment(model.greaterThanDate))) {
      return fromTimestamp;
    }
  }

  return moment(model.greaterThanDate);
};

/**
 * @param {AggregationProcessor} model
 * @param {moment.Moment} now
 * @returns {moment.Moment}
 */
export const getAddFromTimestamp = ({ model, now }) => {
  if (model.toTimestamp) {
    return moment(model.toTimestamp);
  }

  return getFromTimestamp({ model, now });
};

/*
  returns undefined from to now is less than the window size
*/
/**
 * @param {AggregationProcessor} model
 * @param {moment.Moment} now
 * @returns {moment.Moment|*}
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

/**
 * @param pipelineString
 * @returns { ObjectId | {} | Array}
 */
const parsePipelineString = (pipelineString) => {
  let parsedPipeline = JSON.parse(pipelineString);

  parsedPipeline = convert$oid(parsedPipeline);
  parsedPipeline = convert$dte(parsedPipeline);
  parsedPipeline = convertStatementTimestamp(parsedPipeline);
  parsedPipeline = remove$out(parsedPipeline);

  return parsedPipeline;
};

const getSubtractPipelinePart = ({
  model,
  now
}) => {
  const hasSubtraction = (model.fromTimestamp || model.toTimestamp) &&
    moment(model.fromTimestamp).isBefore(moment(model.greaterThanDate));

  if (!hasSubtraction) {
    return;
  }

  const newFromTimestamp = getFromTimestamp({ model, now });

  return {
    $match: {
      timestamp: {
        $gte: moment(model.fromTimestamp).toDate(),
        $lt: newFromTimestamp.toDate()
      }
    }
  };
};

/**
 * @param {AggregationProcessor} model
 * @param {moment.Moment} now
 * @returns {Array}
 */
const getAddPipelines = ({
  model,
  now,
  actualNow
}) => {
  if (!model.useWindowOptimization) {
    return [
      [
        {
          $match: {
            $or: [
              {
                timestamp: {
                  $gte: moment(model.greaterThanDate).toDate(),
                  $lt: moment(model.toTimestamp || now).toDate()
                }
              }
            ]
          },
        },
        ...(parsePipelineString(model.pipelineString))
      ]
    ];
  }

  const addToFrontPipeline = {
    $gt: getAddFromTimestamp({ model, now }).toDate(),
    $lte: getAddToTimestamp({ model, now }).toDate()
  };

  let addToEnd = {};

  if (moment(model.fromTimestamp).isAfter(moment(model.greaterThanDate))) {
    addToEnd = {
      $gte: moment(getFromTimestamp({ model, now })).toDate(),
      $lt: moment(model.fromTimestamp || now).toDate()
    };
  }

  // MIDDLE
  const addToMiddle = model.lastRun === undefined ? [] : [{
    timestamp: {
      $gte: moment(model.fromTimestamp || now).toDate(),
      $lt: getAddFromTimestamp({ model, now }).toDate()
    },
    stored: {
      $gt: moment(model.lastRun).toDate(),
      $lte: moment(actualNow).toDate()
    }
  }];

  const parsedPipeline = parsePipelineString(model.pipelineString);

  return [
    [
      {
        $match: {
          $or: [
            { timestamp: addToFrontPipeline },
            { timestamp: addToEnd },
          ]
        }
      },
      ...parsedPipeline
    ],
    ...(addToMiddle.length === 1 ? [[
      {
        $match: {
          ...(addToMiddle[0])
        }
      },
      ...parsedPipeline
    ]] : [])
  ];
};

/**
 * @param {AggregationProcessor} model
 * @param {moment.Moment} now
 * @returns {Array | void}
 */
const getSubtractPipeline = ({
  model,
  now
}) => {
  const subtractPart = getSubtractPipelinePart({ model, now });
  if (!subtractPart) {
    return;
  }

  const subtractPipeline = [
    subtractPart,
    ...parsePipelineString(model.pipelineString)
  ];
  return subtractPipeline;
};

/**
 * @param {AggregationProcessor} model
 * @returns {number}
 */
const getWindowSize = model => model.previousWindowSize || model.windowSize;

/**
 * @param {string} aggregationProcessorId
 * @param publishQueue
 * @param {moment.Moment} now
 * @param {queue~defaultCallback} done
 * @returns {Promise<*>}
 */
const aggregationProcessor = async (
  {
    aggregationProcessorId,
    publishQueue = publish,
    now, // For testing
    actualNow, // for testing
    readPreference = 'secondaryPreferred'
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

  actualNow = actualNow || moment();
  if (!now) { // Now can be set in the past, for benchmarking.
    now = model.previousWindowSize
      ? actualNow.subtract(model.windowSize, model.windowSizeUnits)
      : actualNow;
  }

  model.greaterThanDate = moment(now).subtract(getWindowSize(model), model.windowSizeUnits);

  const addPipelines = getAddPipelines({ model, now, actualNow });
  const subtractPipeline = getSubtractPipeline({ model, now });

  const addResultsPromise = addPipelines.map((addPipeline, key) => {
    const out = Statement.aggregate(addPipeline).option({
      maxTimeMS: AGGREGATION_TIMEOUT_MS,
      readPreference
    }).hint(
      (key === 0 ?
        { organisation: 1, timestamp: -1, _id: 1 } : { organisation: 1, stored: -1, _id: 1 })
    );
    return out;
  });
  const subtractResultsPromise = model.useWindowOptimization && subtractPipeline &&
    Statement.aggregate(subtractPipeline).option({
      maxTimeMS: AGGREGATION_TIMEOUT_MS,
      readPreference
    }).hint({ organisation: 1, timestamp: -1, _id: 1 });

  const queryResults = await Promise.all([subtractResultsPromise, ...addResultsPromise]);

  const [subtractResults, ...seperateAddResults] = queryResults;

  const addResults = seperateAddResults[0].reduce((acc, addResult) => {
    const existing = acc.find(ac => ac._id === addResult._id);
    if (!existing) {
      return [
        ...acc,
        addResult
      ];
    }
    return [
      ...acc,
      {
        ...existing,
        count: existing.count + addResult.count
      }
    ];
  }, seperateAddResults[1] || []);

  let results;

  if (subtractResults && model.useWindowOptimization) {
    const addSubtractResults = combine(
      addResults,
      subtractResults,
      result => result.model,
      mergeResultsFnConstructor('subtract'),
    );

    results = combine(
      model.results,
      addSubtractResults,
      result => result.model,
      mergeResultsFnConstructor(),
    );
  } else if (!model.useWindowOptimization) {
    results = addResults;
  } else {
    results = combine(
      model.results || [],
      addResults,
      result => result.model,
      mergeResultsFnConstructor(),
    );
  }

  const fromTimestamp = getFromTimestamp({ model, now });
  const toTimestamp = getAddToTimestamp({ model, now });


  const isAtEnd = hasReachedEnd({
    model: {
      toTimestamp: toTimestamp.toDate(),
      fromTimestamp: fromTimestamp.toDate(),
      greaterThanDate: model.greaterThanDate
    },
    now
  });

  await AggregationProcessor.findOneAndUpdate(
    {
      _id: aggregationProcessorId
    },
    {
      $unset: {
        lockedAt: '',
      },
      fromTimestamp: fromTimestamp.toDate(),
      toTimestamp: toTimestamp.toDate(),
      greaterThanDate: model.greaterThanDate,
      results,
      lastRun: actualNow.toDate(),
      lastCompletedRun: isAtEnd ?
        actualNow.toDate() : model.lastCompletedRun
    },
    {
      new: true,
      upsert: false
    }
  );

  if (!isAtEnd) {
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

const aggregationProcessorJob = async (
  args,
  done
) => {
  try {
    return await aggregationProcessor(args, done);
  } catch (err) {
    done(err);
  }
};

export default aggregationProcessorJob;
