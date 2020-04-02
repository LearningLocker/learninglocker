import mongoose from 'mongoose';
import moment from 'moment';
import { chain, isUndefined } from 'lodash';
import { delay } from 'bluebird';

import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import AggregationProcessor from 'lib/models/aggregationProcessor';
import { runAggregationProcessorInitialise } from 'api/controllers/AggregationProcessorController';

const objectId = mongoose.Types.ObjectId;

const shouldCloseWebsocket = aggregationProcessorDocument =>
  !isUndefined(aggregationProcessorDocument.greaterThanDate) &&
    moment(aggregationProcessorDocument.fromTimestamp).isSame(moment(aggregationProcessorDocument.greaterThanDate)) &&
    moment(aggregationProcessorDocument.toTimestamp).isAfter(moment().subtract(10, 'minutes'));
    // && false; // DEBUG ONLY, remove

const maybeCloseResources = async ({
  websocket,
  changeStream,
  aggregationProcessorDocument,
  aggregationProcessorState
}) => {
  if (shouldCloseWebsocket(aggregationProcessorDocument)) {
    aggregationProcessorState.openQueries -= 1;
    console.log('002 changeStream closed');
    await delay(60000);
    changeStream.close();
    if (aggregationProcessorState.openQueries <= 0) {
      websocket.close();
    }
  }
};

const runQuery = async ({ query, authInfo }) => {
  const model = await runAggregationProcessorInitialise({
    authInfo,
    ...query
  });
  return model._id;
};

/**
 * @param {module:ll.WS} ws
 * @param {AuthInfo} authInfo
 * @param {string} aggregationProcessorId
 * @returns {Promise<void>}
 */
const aggregationProcessor = async ({
  ws,
  authInfo,
  aggregationProcessorId,
  query,
  uuid,
  aggregationProcessorState
}) => {
  const scopeFilter = await getScopeFilter({
    modelName: 'aggregationprocessor',
    actionName: 'read',
    authInfo
  });

  if (query) {
    aggregationProcessorId = await runQuery({
      query,
      authInfo
    });
  }

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

  changeStream.on('change', async (dirtyAggregationProcessorDocument) => {
    const aggregationProcessorDocument = {
      ...dirtyAggregationProcessorDocument,
      ...{ _id: aggregationProcessorId }, // restore original document id
    };

    ws.send(JSON.stringify(
      {
        ...aggregationProcessorDocument,
        uuid
      }
    ));

    maybeCloseResources({
      websocket: ws,
      changeStream,
      aggregationProcessorDocument,
      aggregationProcessorState
    });
  });

  const currentAggregationProcessor = await AggregationProcessor.findOne({
    _id: aggregationProcessorId,
    ...scopeFilter
  }).lean();

  ws.send(JSON.stringify(
    {
      ...currentAggregationProcessor,
      uuid
    }
  ));

  maybeCloseResources({
    websocket: ws,
    changeStream,
    aggregationProcessorDocument: currentAggregationProcessor,
    aggregationProcessorState
  });
};

export default aggregationProcessor;
