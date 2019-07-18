import catchErrors from 'api/controllers/utils/catchErrors';
import Statement from 'lib/models/statement';

export const mapReduce = catchErrors(async (req, res) => { // eslint-disable-line import/prefer-default-export
  const authInfo = req.user.authInfo || {};

  console.log('001');

  const result = await Statement.mapReduce({
    map: function map() {
      // console.log('001.1 map', this._id);
      emit('what', { // eslint-disable-line no-undef
        count: 1,
        lastId: this._id
      });
    },
    reduce: function reduce(k, vals) {
      // console.log('001.2 reduce', k, vals);
      return {
        length: vals[0],
        // lastId: Math.max(vals.map(({ lastId }) => lastId))
      };
    },
    out: { reduce: 'test_map_reduce' },
    limit: 5
  });

  // console.log('002 result', JSON.stringify(result, null, 2));
  // console.log('002 result', result);

  res.set('Content-Type', 'application/json');
  res.write(JSON.stringify({
    hello: 'world'
  }));

  return res.end();
});

