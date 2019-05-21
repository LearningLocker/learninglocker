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

  // CREATE INDEX
  // await fullActivitiesCollection.ensureIndex(
  //   {
  //     searchString: 'text',
  //     activityId: 'text'
  //   }, {
  //     name: 'searchStringIndex',
  //     weights: { // don't think this matters as we're using $regex, as opposed to $text
  //       searchString: 2,
  //       activityId: 1
  //     }
  //   }
  // );

  console.log('001');

  await fullActivitiesCollection.createIndex(
    'activityId',
    {
      name: 'activityId',
      // collation: { // Doesn't work with regex
      //   locale: 'en',
      //   strength: 2 
      // }
    }
  );

  await fullActivitiesCollection.createIndex(
    'searchString',
    {
      name: 'searchString',
      // collation: {
      //   locale: 'en',
      //   strength: 2
      // }
    }
  );

  await fullActivitiesCollection.createIndex({
    searchString: 'text'
  }, {
    name: 'searchStringText'
  });



  // await fullActivitiesCollection.ensureIndex({rawSearchString: 'text'}, {
  //   name: 'rawSearchStringIndex'
  // });
  // EO CREATE INDEX

  // console.log('-001', fullActivities);

  console.log('002');

  const query = fullActivities
    .find({});
    // .limit(5000); // DEBUG ONLY, remove

  // const allFullActivities = await query.exec();
  const cursor = query.cursor();

  console.log('003');

  let i = BATCH_SIZE;
  const processStream = highland(cursor)
    .batch(BATCH_SIZE)
    .flatMap((fullActivities) => {
      const bulkOp = fullActivitiesCollection.initializeUnorderedBulkOp();
      loMap(fullActivities, (fullActivity) => {
        const searchString = loMap(values(fullActivity.name), (value) => {
          return value.slice(0, 256); // Or we'll exceed max index size
        });

        bulkOp.find({ _id: fullActivity._id}).updateOne({
          $set: {
            searchString,
            rawSerachString: JSON.stringify(fullActivity.name)
          }
        });
      });

      return highland(bulkOp.execute().then(() => {
        console.log(`FullActivities migrated ${i}`)
        i += BATCH_SIZE;
      }));
    });

  console.log('004');

  await new Promise((resolve, reject) => {
    processStream.on('error', (err) => {
      console.log('Errors', err.writeErrors);
      reject(err);
    });
    processStream.apply(resolve);
  });

  // let i = 0;
  // cursor.on('data', (fullActivity) => {
  //   const searchString = loMap(values(fullActivity.name), (value) => {
  //     return value;
  //   });

  //   fullActivity.searchString = searchString
  //   fullActivities.rawSearchString = JSON.stringify(fullActivities.name);

  //   if(i % 1000 === 0) {
  //     console.log(`${i} processed`);
  //   }

  //   // await fullActivity.save();
    

  //   i += 1;
  // });

  // await new Promise((resolve) => {
  //   cursor.on('close', (err) => {
  //     conosle.log('close', err);
  //     resolve();
  //   });
  // })

  /*
  await fullActivities.find({
    $or: [{
      activityId: /^the\sgo/
    }, {
      searchString: {
        $in: [/^the\sgo/]
      }
    }]
  });
  */  
}

const down = async () => {

}

export default { up, down };
