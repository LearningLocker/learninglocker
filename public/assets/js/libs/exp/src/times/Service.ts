import BaseService = require('../commons/BaseService');
import AggregationRepo = require('../commons/AggregationRepo');

var TIMESTAMP_KEY = 'timestamp';
var STORED_KEY = 'statement.stored';

class Service extends BaseService {
  private result: Array<Object> = [];
  private repo: AggregationRepo;

  constructor(repo: AggregationRepo) {
    super();
    this.repo = repo;
  }

  public getResult() {
    return this.result;
  }

  public update(match_pipe: Object, since: string, until: string, interval: string) {
    var pipeline = this.pipeline(match_pipe, since, until, interval);

    return this.repo.update(pipeline).then(function (data) {
      this.result = data.result;
      this.emitChange();
    }.bind(this), function (response, status, error) {
      console.error(response);
      alert(error);
    });
  }

  private getIsoDate(date_string: string) {
    return (new Date(date_string)).toISOString();
  }

  // Mongo aggregation pipeline constructors.
  private pipeline(match_pipe: any, since: string, until: string, interval: string) {
    var stored_key = '$'+STORED_KEY;

    match_pipe.active = true;
    return [
      {'$match': {
        '$and': [{
          'voided': false,
          'statement.stored': {
            '$gt': this.getIsoDate(since),
            '$lt': this.getIsoDate(until)
          }
        }, match_pipe]
      }},
      {'$group': {
        '_id': this.getIntervalGroupId(interval),
        'count': {'$sum': 1},
        'first': {'$min': stored_key}
      }},
      {'$sort': {
        'first': 1
      }},
      {'$project': {
        '_id': 0,
        'count': 1,
        'first': 1
      }}
    ];
  }

  private getIntervalGroupId(interval: string) {
    var interval_length = 1;
    var id: any = {};
    var timestamp_key = '$'+TIMESTAMP_KEY;

    switch (interval) {
      case 'Hour': id.hour = {'$hour': timestamp_key};
      case 'Day': id.day = {'$dayOfMonth': timestamp_key};
      case 'Month': id.month = {'$month': timestamp_key};
      default: id.year = {'$year': timestamp_key};
    }

    var mongo_interval = Object.keys(id[interval.toLowerCase()])[0];
    id[interval] = {'$subtract': [{}, {'$mod': [{}, interval_length]}]};
    id[interval]['$subtract'][0][mongo_interval] = timestamp_key;
    id[interval]['$subtract'][1]['$mod'][0][mongo_interval] = timestamp_key;

    return id;
  }
}

export = Service;