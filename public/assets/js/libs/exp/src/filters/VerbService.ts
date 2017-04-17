import BaseService = require('../commons/BaseService');
import AggregationRepo = require('../commons/AggregationRepo');

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

  public update(match_pipe: any, search: string) {
    var pipeline = this.pipeline(match_pipe, search);

    return this.repo.update(pipeline).then(function (data) {
      this.result = data.result;
      this.emitChange();
    }.bind(this), function (response, status, error) {
      console.error(response);
      alert(error);
    });
  }

  private pipeline(match_pipe: any, search: string) {
    match_pipe.active = true;
    match_pipe.voided = false;
    return [
      {'$match': {
        '$and': [{
          'statement.verb.id': {'$regex': search, '$options': 'i'}
        }, match_pipe]
      }},
      {'$group': {
        '_id': '$statement.verb.id',
        'count': {'$sum': 1},
        'display': {'$first': '$statement.verb.display'}
      }},
      {'$sort': {
        'count': 1
      }},
      {'$project': {
        '_id': 1,
        'display': 1
      }}
    ];
  }
}

export = Service;
