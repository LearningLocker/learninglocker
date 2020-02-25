import mongoose from 'mongoose';
import moment from 'moment';
import { chain, isUndefined, omit } from 'lodash';

import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import AggregationProcessor from 'lib/models/aggregationProcessor';

const objectId = mongoose.Types.ObjectId;

/**
 * @param {module:ll.WS} ws
 * @param {AuthInfo} authInfo
 * @param {string} aggregationProcessorId
 * @returns {Promise<void>}
 */
const aggregationProcessor = async ({
  ws,
  authInfo,
  aggregationProcessorId
}) => {
  const scopeFilter = await getScopeFilter({
    modelName: 'aggregationprocessor',
    actionName: 'read',
    authInfo
  });

  /**
   * @see https://docs.mongodb.com/manual/changeStreams/index.html - Go to TIP section
   */
  const safeNewRoot = {
    ...{ _id: '$_id' }, // save original change stream event id
    ...chain(AggregationProcessor.schema.paths)
      .omit(['_id'])
      .keys()
      .keyBy()
      .mapValues(key => `$fullDocument.${key}`)
      .value()
  };

  const changeStream = AggregationProcessor.watch(
    [
      {
        $match: {
          'documentKey._id': objectId(aggregationProcessorId),
          fullDocument: { // Might be a delete operation, then fullDocument wont exist.
            $exists: true
          }
        }
      },
      /**
       * We need to avoid replacing event's _id because it will raise an error starting from MongoDB v4.2.
       * And also it's an recommendation not to do so in versions below v4.2
       * @see https://docs.mongodb.com/manual/changeStreams/index.html - Go to TIP section
       */
      { $replaceRoot: { newRoot: safeNewRoot } },
      { $match: scopeFilter }
    ],
    {
      fullDocument: 'updateLookup'
    }
  );

  changeStream.on('change', (dirtyAggregationProcessorDocument) => {
    const aggregationProcessorDocument = {
      ...omit(dirtyAggregationProcessorDocument, ['_id']), // remove change stream event id
      ...{ _id: aggregationProcessorId }, // restore original document id
    };

    ws.send(JSON.stringify(aggregationProcessorDocument));

    if (
      !isUndefined(aggregationProcessorDocument.gtDate) &&
      moment(aggregationProcessorDocument.fromTimestamp).isSame(moment(aggregationProcessorDocument.gtDate)) &&
      moment(aggregationProcessorDocument.toTimestamp).isAfter(moment().subtract(10, 'minutes'))
    ) {
      ws.close();
      changeStream.close();
    }
  });

  const currentAggregationProcessor = await AggregationProcessor.findOne({
    _id: aggregationProcessorId,
    ...scopeFilter
  });

  ws.send(JSON.stringify(currentAggregationProcessor));
};

export default aggregationProcessor;
