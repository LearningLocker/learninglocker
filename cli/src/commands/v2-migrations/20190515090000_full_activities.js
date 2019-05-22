import { getConnection } from 'lib/connections/mongoose';
import 'lib/models/fullActivities';
import { values, map as loMap } from 'lodash';
import highland from 'highland';
import { map } from 'bluebird';

const connection = getConnection();

const BATCH_SIZE = 10000; // TODO: Change to 10,000

const up = async () => {
  const fullActivities = connection.model('FullActivities');
  const fullActivitiesCollection = connection.collection('fullActivities');

  // EO CREATE INDEX

  // console.log('-001', fullActivities);

  const query = fullActivities
    .find({});
    // .limit(5000); // DEBUG ONLY, remove

  // const allFullActivities = await query.exec();
  const cursor = query.cursor();

  let i = BATCH_SIZE;
  const processStream = highland(cursor)
    .batch(BATCH_SIZE)
    .flatMap((fullActivities) => {
      const bulkOp = fullActivitiesCollection.initializeUnorderedBulkOp();
      loMap(fullActivities, (fullActivity) => {

        bulkOp.find({ _id: fullActivity._id}).updateOne({
          $set: {
            searchString: JSON.stringify({
              activityId: fullActivity.activityId,
              name: fullActivity.name
            })
          }
        });
      });

      return highland(bulkOp.execute().then(() => {
        console.log(`FullActivities migrated ${i}`)
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
