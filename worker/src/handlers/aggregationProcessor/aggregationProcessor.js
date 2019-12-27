import { LOCK_TIMEOUT_MINUTES, AGGREGATION_PROCESSOR_QUEUE } from 'lib/constants/aggregationProcessor';
import moment from 'moment';
import AggregationProcessor from 'lib/models/aggregationProcessor';
import Statement from 'lib/models/statement';
import { get, omit } from 'lodash';
import { publish } from 'lib/services/queue';

export const combine = (as, bs, keyFn, mergeFn) => {
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

export const hasReachedEnd = ({ model, now }) => {
  return (
    moment(model.fromTimestamp).isSame(moment(model.gtDate)) &&
    moment(model.toTimestamp).isSame(now)
  );
};

export const getFromTimestamp = ({ model, now }) => {
  if (!model.fromTimestamp || moment(model.fromTimestamp).isAfter(moment(model.gtDate))) {
    const blockSizeSeconds = moment(model.fromTimestamp || now).subtract(model.blockSizeSeconds, 'seconds');

    if (blockSizeSeconds.isAfter(moment(model.gtDate))) {
      return blockSizeSeconds;
    }

    return moment(model.gtDate);
  } else if (moment(model.fromTimestamp).isBefore(moment(model.gtDate))) {
    const blockSizeSeconds = moment(model.fromTimestamp || now).add(model.blockSizeSeconds, 'seconds');
    if (blockSizeSeconds.isBefore(moment(model.gtDate))) {
      return blockSizeSeconds;
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
  const addToFrontPipeline =
    {
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

  const addPipeline = [
    { $match: {
      $or: [
        { timestamp: addToFrontPipeline },
        { timestamp: addToEnd }
      ]
    } },
    ...(JSON.parse(model.pipelineString))
  ];

  return addPipeline;
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

  const subtractPipeline = [
    {
      $match: {
        timestamp: {
          $gte: moment(model.fromTimestamp).toDate(),
          $lt: newFromTimestamp.toDate()
        }
      }
    },
    ...(JSON.parse(model.pipelineString))
  ];

  return subtractPipeline;
};

const getWindowSize = (model) => {
  if (model.previousWindowSize) {
    return model.previousWindowSize;
  }
  return model.windowSize;
};

const aggregationProcessor = async ({
  aggregationProcessorId,
  publishQueue = publish,
  now
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
  const subtractResultsPromise = subtractPipeline && Statement.aggregate(subtractPipeline);

  const [addResults, subtractResults] = await Promise.all([addResultsPromise, subtractResultsPromise]);

  let results;
  if (subtractResults) {
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

  // await delay(2000); // DEBUG ONLY, remove

  const newModel = await AggregationProcessor.findOneAndUpdate({
    _id: aggregationProcessorId
  }, {
    $unset: {
      lockedAt: '',
    },
    fromTimestamp: fromTimestamp.toDate(),
    toTimestamp: toTimestamp.toDate(),
    gtDate: model.gtDate,
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
