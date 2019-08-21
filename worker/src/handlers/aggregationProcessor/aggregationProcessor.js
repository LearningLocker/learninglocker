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

export const hasReachedEnd = (model) => {
  if (moment(model.fromTimestamp).isSameOrBefore(moment(model.gtDate))) {
    return true;
  }
  return false;
};

export const getFromTimestamp = (model) => {
  const blockSize = moment().subtract(model.blockSize, 'seconds');
  const windowSize = moment().subtract(model.windowSize, model.windowSizeUnits);

  if (blockSize.isAfter(windowSize)) {
    return blockSize;
  }

  return windowSize;
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

  const pipeline = JSON.parse(model.pipelineString);
  let addPipeline;
  let subtractPipeline;

  const fromTimestamp = getFromTimestamp(model);
  const toTimestamp = moment(); // To now

  if (!model.fromTimestamp && !model.toTimestamp) {
    addPipeline = [
      { $match: {
        timestamp: {
          $gt: fromTimestamp.toDate()
        }
      } },
      ...pipeline
    ];
  } else {
    addPipeline = [
      { $match: {
        timestamp: {
          $gte: moment(model.toTimestamp).toDate()
        }
      } },
      ...pipeline
    ];

    subtractPipeline = [
      {
        $match: {
          timestamp: {
            $gt: fromTimestamp.toDate(),
            $lt: moment(model.fromTimestamp).toDate()
          }
        }
      },
      ...pipeline
    ];
  }

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

  if (!hasReachedEnd(newModel)) {
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
