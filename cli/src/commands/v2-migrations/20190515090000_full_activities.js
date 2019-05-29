import { getConnection } from 'lib/connections/mongoose';
import 'lib/models/fullActivities';
import { map as loMap } from 'lodash';
import highland from 'highland';

const connection = getConnection();

const BATCH_SIZE = 10000;

const up = async () => {
  const fullActivities = connection.model('FullActivities');
  const fullActivitiesCollection = connection.collection('fullActivities');

  // EO CREATE INDEX


  const query = fullActivities
    .find({});

  const cursor = query.cursor();

  let i = BATCH_SIZE;
  const processStream = highland(cursor)
    .batch(BATCH_SIZE)
    .flatMap((fullActivitiesBatch) => {
      const bulkOp = fullActivitiesCollection.initializeUnorderedBulkOp();
      loMap(fullActivitiesBatch, (fullActivity) => {
        bulkOp.find({ _id: fullActivity._id }).updateOne({
          $set: {
            searchString: JSON.stringify({
              activityId: fullActivity.activityId,
              name: fullActivity.name
            })
          }
        });
      });

      return highland(bulkOp.execute().then(() => {
        console.log(`FullActivities migrated ${i}`);
        i += BATCH_SIZE;
      }));
    });

  await new Promise((resolve, reject) => {
    processStream.on('error', (err) => {
      console.log('Errors', err.writeErrors);
      reject(err);
    });
    processStream.apply(resolve);
  });
}

const down = async () => {

}

export default { up, down };
