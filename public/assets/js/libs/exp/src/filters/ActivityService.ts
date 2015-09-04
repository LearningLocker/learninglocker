import BaseService = require('../commons/BaseService');
import AggregationRepo = require('../commons/AggregationRepo');

class Service extends BaseService {
  private result: Array<Object> = [];
  private types: Array<string> = [];
  private repo: AggregationRepo;

  constructor(repo: AggregationRepo) {
    super();
    this.repo = repo;
  }

  public getResult() {
    return this.result;
  }

  public getTypes() {
    return this.types;
  }

  public update(match_pipe: any, search: string, type: string) {
    var pipeline = this.pipeline(match_pipe, search, type);

    return this.repo.update(pipeline).then(function (data) {
      this.result = data.result;
      this.emitChange();
    }.bind(this), function (response, status, error) {
      console.error(response);
      alert(error);
    });
  }

  public updateTypes(match_pipe: any) {
    var pipeline = this.typePipeline(match_pipe);

    return this.repo.update(pipeline).then(function (data) {
      this.types = data.result.map(function (result) {
        return result._id;
      });
      this.emitChange();
    }.bind(this), function (response, status, error) {
      console.error(response);
      alert(error);
    });
  }

  private pipeline(match_pipe: any, search: string, type: string) {
    match_pipe.active = true;
    match_pipe.voided = false;

    if (type) {
      match_pipe['statement.object.definition.type'] = type;
    }

    return [
      {'$match': {
        '$and': [{
          '$or': [{
            'statement.object.id': {'$regex': search, '$options': 'i'}
          }]
        }, match_pipe]
      }},
      {'$group': {
        '_id': '$statement.object.id',
        'count': {'$sum': 1},
        'name': {'$first': '$statement.object.definition.name'}
      }},
      {'$sort': {
        'count': 1
      }},
      {'$project': {
        '_id': 1,
        'name': 1
      }}
    ];
  }

  private typePipeline(match_pipe: any) {
    match_pipe.active = true;
    match_pipe.voided = false;
    return [
      {'$match': match_pipe},
      {'$group': {
        '_id': '$statement.object.definition.type',
        'count': {'$sum': 1}
      }},
      {'$sort': {
        'count': 1
      }},
      {'$project': {
        '_id': 1
      }}
    ];
  }
}

export = Service;
