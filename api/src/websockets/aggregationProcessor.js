import getScopeFilter from 'lib/services/auth/filters/getScopeFilter';
import AggregationProcessor from 'lib/models/aggregationProcessor';
import mongoose from 'mongoose';
import moment from 'moment';

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
      {
        $match: {
          'documentKey._id': objectId(aggregationProcessorId),
          fullDocument: { // Might be a delete operation, then fullDocument wont exist.
            $exists: true
          }
        }
      },
      { $replaceRoot: { newRoot: '$fullDocument' } },
      { $match: scopeFilter }
    ], {
      fullDocument: 'updateLookup'
    }
  );

  changeStream.on('change', (next) => {
    ws.send(JSON.stringify(next));

    if (
      moment(next.fromTimestamp).isSame(moment(next.gtDate)) &&
      moment(next.toTimestamp).isAfter(moment().subtract(10, 'minutes'))
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
