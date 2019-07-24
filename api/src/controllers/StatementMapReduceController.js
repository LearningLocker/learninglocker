import catchErrors from 'api/controllers/utils/catchErrors';
import Statement from 'lib/models/statement';
import mongoose from 'mongoose';
import { getConnection } from 'lib/connections/mongoose';
import { range, isNull } from 'lodash';


const objectId = mongoose.Types.ObjectId;

const COLLECITON_NAME = 'mapReduceStatementsPerDay';

const schema = new mongoose.Schema({
  value: new mongoose.Schema({
    _id: { type: String },
    count: { type: Number },
    startTimestamp: { type: Date },
    endTimestamp: { type: Date }
  })
});
export const mapReduceStatementsPerDay =
  getConnection().model('MapReduceStatementsPerDay', schema, 'mapReduceStatementsPerDay');

export const statementsPerDayMapReduce = async ({
  organisation, // string organisation id
  gt // String date
}) => {
  const days = range(7);
  const gtDate = new Date(gt);

  const previousReduces = await mapReduceStatementsPerDay.collection.find({
    _id: { $in: [...(days.map(weekDay => `${organisation}-${weekDay}`))] }
  }).toArray();

  const startDate = previousReduces.reduce((acc, item) => {
    const out = (isNull(acc) || item.value.startTimestamp < acc ? item.value.startTimestamp : acc);
    return out;
  }, null);
  const endDate = previousReduces.reduce((acc, item) =>
    (isNull(acc) || item.endTimestamp < acc ? item.endTimestamp : acc),
    null
  );

  await Statement.mapReduce({
    map: function map() {
      emit( // eslint-disable-line no-undef
        `${this.organisation}-${this.timestamp.getDay()}`,
        {
          count: 1,
          startTimestamp: this.timestamp,
          endTimestamp: this.timestamp,
        }
       );
    },
    reduce: function reduce(k, vals) {
      return {
        count: vals.reduce((acc, item, ke) => {
          if (
            ke !== 0 &&
            (this.gtDate && item.startTimestamp < this.gtDate)
          ) {
            return (acc - item.count);
          }
          return (acc + item.count);
        }, 0),
        startTimestamp: vals.reduce((acc, { startTimestamp }) => (acc && acc < startTimestamp ? acc : startTimestamp)),
        endTimestamp: vals.reduce((acc, { endTimestamp }) => (acc && acc > endTimestamp ? acc : endTimestamp))
      };
    },
    out: { reduce: COLLECITON_NAME },
    scope: {
      gtDate
    },
    quey: {
      $or: [
        {
          $and: [
            {
              timestamp: { $lte: gtDate }
            }, {
              timestamp: { $gt: startDate }
            }
          ]
        },
        {
          timestamp: { $gt: endDate }
        }
      ]
    }
  });

  const reduceResult = await mapReduceStatementsPerDay.collection.find({
    _id: { $in: [...(days.map(weekDay => `${organisation}-${weekDay}`))] }
  }).toArray();

  const out = reduceResult.map(item => ({
    model: item._id.replace(/^[0-9a-f]+-/, ''),
    count: item.value.count
  }));

  return out;
};

export const mapReduce = catchErrors(async (req, res) => { // eslint-disable-line import/prefer-default-export
  const authInfo = req.user.authInfo || {};

  console.log('001');

  res.set('Content-Type', 'application/json');
  res.write(JSON.stringify({
    hello: 'world'
  }));

  return res.end();
});

