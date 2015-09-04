import BaseService = require('../commons/BaseService');
import AggregationRepo = require('../commons/AggregationRepo');

var TIMESTAMP_KEY = 'timestamp';
var RESULT_KEY = 'statement.result.score.raw';
var MAX_KEY = 'statement.result.score.max';
var RESULT_BUCKET_KEY = 'result_bucket';

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
  private pipeline(match_pipe: Object, since: string, until: string, interval: string): Array<Object> {
    var interval_pipelines = {
      'Hour-of-day': this.datePipeline('$hour'),
      'Day-of-week': this.datePipeline('$dayOfWeek'),
      'Day-of-month': this.datePipeline('$dayOfMonth'),
      'Week-of-year': this.datePipeline('$week'),
      'Month-of-year': this.datePipeline('$month'),
      'Results-tens': this.resultPipeline(10),
      'Results-ones': this.resultPipeline(1),
      'Verbs': this.propPipeline('$statement.verb.id', '$statement.verb.display.en-US'),
      'Actors': this.propPipeline({
        'account-name': '$statement.actor.account.name',
        'account-home': '$statement.actor.account.homePage',
        'mbox': '$statement.actor.mbox'
      }, '$statement.actor.name'),
      'Activities': this.propPipeline('$statement.object.id', '$statement.object.definition.name.en-US')
    };
    return interval_pipelines[interval](match_pipe, since, until);
  }

  private datePipeline(interval: string) {
    return function (match_pipe: Object, since: string, until: string): Array<Object> {
      var id = {};
      id[interval] = '$' + TIMESTAMP_KEY;

      return [
        this.match(match_pipe, since, until),
        {'$group': {
          '_id': id,
          'count': {'$sum': 1}
        }},
        this.sort(),
        this.project()
      ];
    }.bind(this);
  }

  private resultPipeline(bucket_size: number) {
    return function (match_pipe: Object, since: string, until: string) {
      var result_key = '$' + RESULT_KEY;
      var max_key = '$' + MAX_KEY;
      var match = this.match(match_pipe, since, until);
      var bucket = this.trunc(this.div(this.mult(this.div(result_key, max_key), 100), bucket_size));
      match['$match']['$and'][0][RESULT_KEY] = {'$exists': true};
      match['$match']['$and'][0][MAX_KEY] = {'$exists': true};

      return [
        match,
        {'$project': {
          '_id': 0,
          'result_bucket': bucket_size > 1 ? this.cond(this.eq(bucket, bucket_size), bucket_size - 1, bucket) : bucket
        }},
        {'$group': {
          '_id': '$result_bucket',
          'count': {'$sum': 1}
        }},
        this.sort(),
        this.project()
      ];
    }.bind(this);
  }

  private propPipeline(value: any, display: string) {
    return function (match_pipe: Object, since: string, until: string) {
      return [
        this.match(match_pipe, since, until),
        {'$group': {
          '_id': value,
          'count': {'$sum': 1},
          'display': {'$first': display}
        }},
        {'$project': {
          '_id': '$display',
          'count': '$count'
        }},
        {'$sort': {
          'count': 1
        }},
        this.project()
      ];
    }.bind(this);
  }

  // Mongo aggregation pipeline operators.
  private match(match_pipe: any, since: string, until: string) {
    match_pipe.active = true;
    return {'$match': {
      '$and': [{
        'voided': false,
        'statement.stored': {
          '$gt': this.getIsoDate(since),
          '$lt': this.getIsoDate(until)
        }
      }, match_pipe]
    }};
  }
  private sort() {
    return {'$sort': {
      '_id': 1
    }};
  }
  private project() {
    return {'$project': {
      '_id': 1,
      'count': 1
    }};
  }

  // Mongo aggregation arithmetic operators.
  private trunc(value) {
    return this.div(
      this.sub(
        this.mult(value, 100),
        this.mod(this.mult(value, 100), 100)
      ),
      100
    );
  }
  private div(x, y) {
    return {'$divide': [x, y]};
  }
  private sub(x, y) {
    return {'$subtract': [x, y]};
  }
  private mult(x, y) {
    return {'$multiply': [x, y]};
  }
  private mod(x, y) {
    return {'$mod': [x, y]};
  }
  private eq(x, y) {
    return {'$eq': [x, y]};
  }
  private cond(cond, then, otherwise) {
    return {'$cond': [cond, then, otherwise]};
  }
}

export = Service;
