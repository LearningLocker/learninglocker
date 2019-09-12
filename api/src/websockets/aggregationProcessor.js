import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import AggregationProcessor from 'lib/models/aggregationProcessor';
import mongoose from 'mongoose';

const objectId = mongoose.Types.ObjectId;

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

  const changeStream = AggregationProcessor.watch(
    [
      { $match: { 'documentKey._id': objectId(aggregationProcessorId) } },
      { $replaceRoot: { newRoot: '$fullDocument' } },
      { $match: scopeFilter }
    ], {
      fullDocument: 'updateLookup'
    }
  );

  changeStream.on('change', (next) => {
    console.log('SHOULD BE HAPPENING');
    ws.send(JSON.stringify(next));

    // TODO: when we have reached the end, close the ws and clean up. Maybe also add a timeout.
  });

  const currentAggregationProcessor = await AggregationProcessor.findOne({
    _id: aggregationProcessorId,
    ...scopeFilter
  });
  ws.send(JSON.stringify(currentAggregationProcessor));
};

export default aggregationProcessor;
